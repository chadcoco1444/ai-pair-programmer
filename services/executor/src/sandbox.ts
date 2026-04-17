import Docker from "dockerode";
import { Readable } from "stream";
import type { RunConfig, RunResult } from "./runners/types";

const docker = new Docker();

interface SandboxOptions {
  image: string;
  command: string[];
  stdin: string;
  timeout: number;
  memoryLimit: number;
}

/**
 * Demux Docker multiplexed stream logs.
 * Docker logs have 8-byte headers: [stream_type(1), 0, 0, 0, size(4 big-endian)]
 * stream_type: 1 = stdout, 2 = stderr
 */
function demuxDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      // Incomplete header — treat remaining as stdout
      stdout += buffer.subarray(offset).toString("utf-8");
      break;
    }

    const streamType = buffer[offset];
    const frameSize = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + frameSize > buffer.length) {
      // Incomplete frame
      const chunk = buffer.subarray(offset).toString("utf-8");
      if (streamType === 2) stderr += chunk;
      else stdout += chunk;
      break;
    }

    const chunk = buffer.subarray(offset, offset + frameSize).toString("utf-8");
    if (streamType === 2) {
      stderr += chunk;
    } else {
      stdout += chunk;
    }
    offset += frameSize;
  }

  return { stdout, stderr };
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

    // Write stdin
    const stdinStream = new Readable();
    stdinStream.push(stdin);
    stdinStream.push(null);
    stdinStream.pipe(stream);

    // Set timeout
    const timeoutId = setTimeout(async () => {
      timedOut = true;
      try {
        await container.kill();
      } catch {
        // Container may already be stopped
      }
    }, timeout);

    // Wait for container to finish
    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    // Get logs and properly demux
    const logBuffer = await container.logs({
      stdout: true,
      stderr: true,
      follow: false,
    });
    const rawBuffer = Buffer.isBuffer(logBuffer)
      ? logBuffer
      : Buffer.from(logBuffer as any);

    const { stdout, stderr } = demuxDockerLogs(rawBuffer);

    // Check OOM
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
      // Ignore removal failure
    }
  }
}

export async function compileInSandbox(
  image: string,
  code: string,
  filename: string,
  compileCmd: string,
  timeout: number,
  skipCodeWrite: boolean = false
): Promise<{ success: boolean; error?: string; compiledImage?: string }> {
  const codeB64 = Buffer.from(code).toString("base64");

  // If skipCodeWrite, compileCmd already includes file writing (e.g., C++ runner)
  const cmdStr = skipCodeWrite
    ? compileCmd
    : `printf '%s' "${codeB64}" | base64 -d > /tmp/${filename} && ${compileCmd}`;

  const container = await docker.createContainer({
    Image: image,
    Cmd: [
      "sh",
      "-c",
      cmdStr,
    ],
    AttachStdout: true,
    AttachStderr: true,
    NetworkDisabled: true,
    HostConfig: {
      Memory: 512 * 1024 * 1024,
      PidsLimit: 50,
    },
  });

  try {
    await container.start();

    const timeoutId = setTimeout(async () => {
      try { await container.kill(); } catch {}
    }, timeout);

    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    if (waitResult.StatusCode !== 0) {
      const logBuffer = await container.logs({ stdout: true, stderr: true });
      const rawBuffer = Buffer.isBuffer(logBuffer)
        ? logBuffer
        : Buffer.from(logBuffer as any);
      const { stdout, stderr } = demuxDockerLogs(rawBuffer);
      return { success: false, error: stderr || stdout };
    }

    // Commit compiled container as new image
    const tag = Date.now().toString();
    await container.commit({ repo: "skill-compiled", tag });

    return { success: true, compiledImage: `skill-compiled:${tag}` };
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
      console.warn(`Image ${imageName} not found. Please build language images first.`);
    }
  }
}
