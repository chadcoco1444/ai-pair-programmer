import { runInSandbox, compileInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runC(config: RunConfig): Promise<RunResult & { compileError?: string }> {
  const lang = LANGUAGE_CONFIG.C;
  const filename = `solution${lang.extension}`;
  const compileCmd = lang.compileCmd!(filename);

  // 編譯階段
  const compileResult = await compileInSandbox(
    lang.image,
    config.code,
    filename,
    compileCmd,
    30000
  );

  if (!compileResult.success) {
    return {
      stdout: "",
      stderr: compileResult.error || "編譯失敗",
      exitCode: 1,
      runtime: 0,
      memory: 0,
      timedOut: false,
      oomKilled: false,
      compileError: compileResult.error,
    };
  }

  // 執行階段
  const result = await runInSandbox({
    image: compileResult.compiledImage!,
    command: ["sh", "-c", lang.runCmd()],
    stdin: config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });

  return result;
}
