import Docker from "dockerode";
import { Readable } from "stream";
import type { RunConfig, RunResult, LANGUAGE_CONFIG } from "./runners/types";

const docker = new Docker();

interface SandboxOptions {
  image: string;
  command: string[];
  stdin: string;
  timeout: number;
  memoryLimit: number;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function runInSandbox(options: SandboxOptions): Promise<RunResult> {
  const { image, command, stdin, timeout, memoryLimit } = options;

  const startTime = Date.now();

  const container = await docker.createContainer({
    Image: image,
    Cmd: command,
    OpenStdin: true,
    StdinOnce: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    NetworkDisabled: true,
    HostConfig: {
      Memory: memoryLimit * 1024 * 1024,
      MemorySwap: memoryLimit * 1024 * 1024,
      PidsLimit: 50,
      ReadonlyRootfs: false,
      CapDrop: ["ALL"],
      SecurityOpt: ["no-new-privileges"],
    },
    User: "runner",
  });

  let timedOut = false;
  let oomKilled = false;

  try {
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
      hijack: true,
    });

    await container.start();

    // 寫入 stdin
    const stdinStream = new Readable();
    stdinStream.push(stdin);
    stdinStream.push(null);
    stdinStream.pipe(stream);

    // 設定超時
    const timeoutId = setTimeout(async () => {
      timedOut = true;
      try {
        await container.kill();
      } catch {
        // 容器可能已經停止
      }
    }, timeout);

    // 等待容器結束
    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    // 取得輸出
    const logs = await container.logs({ stdout: true, stderr: true });
    const output = logs.toString("utf-8");

    // 分離 stdout 和 stderr（簡化處理）
    const stdout = output;
    const stderr = "";

    // 檢查 OOM
    const inspectResult = await container.inspect();
    oomKilled = inspectResult.State.OOMKilled || false;

    const runtime = Date.now() - startTime;
    const memoryUsage = inspectResult.HostConfig?.Memory
      ? Math.round((inspectResult.HostConfig.Memory || 0) / 1024)
      : 0;

    return {
      stdout,
      stderr,
      exitCode: waitResult.StatusCode,
      runtime,
      memory: memoryUsage,
      timedOut,
      oomKilled,
    };
  } finally {
    try {
      await container.remove({ force: true });
    } catch {
      // 忽略移除失敗
    }
  }
}

export async function compileInSandbox(
  image: string,
  code: string,
  filename: string,
  compileCmd: string,
  timeout: number
): Promise<{ success: boolean; error?: string; compiledImage?: string }> {
  const container = await docker.createContainer({
    Image: image,
    Cmd: ["sh", "-c", `cat > /tmp/${filename} && ${compileCmd}`],
    OpenStdin: true,
    StdinOnce: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    NetworkDisabled: true,
    HostConfig: {
      Memory: 512 * 1024 * 1024,
      PidsLimit: 50,
    },
  });

  try {
    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
      hijack: true,
    });

    await container.start();

    const stdinStream = new Readable();
    stdinStream.push(code);
    stdinStream.push(null);
    stdinStream.pipe(stream);

    const timeoutId = setTimeout(async () => {
      try { await container.kill(); } catch {}
    }, timeout);

    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    if (waitResult.StatusCode !== 0) {
      const logs = await container.logs({ stdout: true, stderr: true });
      return { success: false, error: logs.toString("utf-8") };
    }

    // 將編譯好的容器 commit 為新映像
    const committedImage = await container.commit({
      repo: "skill-compiled",
      tag: Date.now().toString(),
    });

    return { success: true, compiledImage: `skill-compiled:${Date.now()}` };
  } finally {
    try {
      await container.remove({ force: true });
    } catch {}
  }
}

export async function ensureImagesExist(): Promise<void> {
  const images = ["skill-runner-python", "skill-runner-c-cpp", "skill-runner-javascript"];

  for (const imageName of images) {
    try {
      await docker.getImage(imageName).inspect();
    } catch {
      console.warn(`映像 ${imageName} 不存在。請先建置語言映像。`);
    }
  }
}
