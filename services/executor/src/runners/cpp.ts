import { runInSandbox, compileInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import * as fs from "fs";
import * as path from "path";

// Load json_helper.h content at startup
const JSON_HELPER_PATH = path.resolve(
  __dirname,
  "../../../../tests/solutions_cpp/json_helper.h"
);

let jsonHelperContent = "";
try {
  jsonHelperContent = fs.readFileSync(JSON_HELPER_PATH, "utf-8");
} catch {
  // Fallback: header may not exist in production
}

export async function runCpp(config: RunConfig): Promise<RunResult & { compileError?: string }> {
  const lang = LANGUAGE_CONFIG.CPP;
  const filename = `solution${lang.extension}`;
  const compileCmd = lang.compileCmd!(`/tmp/${filename}`);

  // Build bootstrap that writes code, json_helper.h, and args.json
  const codeB64 = Buffer.from(config.code).toString("base64");
  const argsB64 = Buffer.from(JSON.stringify(config.args)).toString("base64");
  const headerB64 = jsonHelperContent
    ? Buffer.from(jsonHelperContent).toString("base64")
    : "";

  // Construct shell commands to write all files before compiling
  const writeCommands: string[] = [
    `printf '%s' "${codeB64}" | base64 -d > /tmp/${filename}`,
    `printf '%s' "${argsB64}" | base64 -d > /tmp/args.json`,
  ];
  if (headerB64) {
    writeCommands.push(
      `printf '%s' "${headerB64}" | base64 -d > /tmp/json_helper.h`
    );
  }

  const fullCmd = writeCommands.join(" && ") + ` && ${compileCmd} -I/tmp`;

  const compileResult = await compileInSandbox(
    lang.image,
    "", // code is embedded in fullCmd via base64
    filename,
    fullCmd,
    30000,
    true // skipCodeWrite — we write it ourselves in fullCmd
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

  const result = await runInSandbox({
    image: compileResult.compiledImage!,
    command: ["sh", "-c", lang.runCmd()],
    stdin: "",
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });

  return result;
}
