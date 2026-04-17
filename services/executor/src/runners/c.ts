import { runInSandbox, compileInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import * as fs from "fs";
import * as path from "path";

// Load json_helper_c.h content at startup (may not exist yet in Phase 3)
const JSON_HELPER_PATH = path.resolve(
  __dirname,
  "../../../../tests/solutions_c/json_helper.h"
);

let jsonHelperContent = "";
try {
  jsonHelperContent = fs.readFileSync(JSON_HELPER_PATH, "utf-8");
} catch {
  // Fallback
}

/**
 * Compile C code once, returning the compiled image tag.
 * Reusable across multiple test cases.
 */
export async function compileC(code: string): Promise<{ success: boolean; image?: string; error?: string }> {
  const lang = LANGUAGE_CONFIG.C;
  const filename = `solution${lang.extension}`;
  const compileCmd = lang.compileCmd!(`/tmp/${filename}`);

  const codeB64 = Buffer.from(code).toString("base64");
  const headerB64 = jsonHelperContent
    ? Buffer.from(jsonHelperContent).toString("base64")
    : "";

  const writeCommands: string[] = [
    `printf '%s' "${codeB64}" | base64 -d > /tmp/${filename}`,
  ];
  if (headerB64) {
    writeCommands.push(
      `printf '%s' "${headerB64}" | base64 -d > /tmp/json_helper.h`
    );
  }

  const fullCmd = writeCommands.join(" && ") + ` && ${compileCmd} -I/tmp`;

  const compileResult = await compileInSandbox(
    lang.image,
    "",
    filename,
    fullCmd,
    30000,
    true // skipCodeWrite
  );

  if (!compileResult.success) {
    return { success: false, error: compileResult.error };
  }
  return { success: true, image: compileResult.compiledImage };
}

/**
 * Run a compiled C binary with specific args.
 * Writes args to /tmp/args.json before running.
 */
export async function runCCompiled(
  image: string,
  args: any[],
  timeout: number,
  memoryLimit: number
): Promise<RunResult> {
  const argsB64 = Buffer.from(JSON.stringify(args)).toString("base64");
  const cmd = `printf '%s' "${argsB64}" | base64 -d > /tmp/args.json && /tmp/solution`;

  return runInSandbox({
    image,
    command: ["sh", "-c", cmd],
    stdin: "",
    timeout,
    memoryLimit,
  });
}

/**
 * Legacy single-step: compile + run in one call.
 */
export async function runC(config: RunConfig): Promise<RunResult & { compileError?: string }> {
  const compile = await compileC(config.code);
  if (!compile.success) {
    return {
      stdout: "",
      stderr: compile.error || "編譯失敗",
      exitCode: 1,
      runtime: 0,
      memory: 0,
      timedOut: false,
      oomKilled: false,
      compileError: compile.error,
    };
  }
  return runCCompiled(compile.image!, config.args, config.timeout, config.memoryLimit);
}
