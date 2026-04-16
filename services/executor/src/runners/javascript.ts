import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  // Base64 encode to safely pass code without shell escaping issues
  const codeB64 = Buffer.from(config.code).toString("base64");

  return runInSandbox({
    image: lang.image,
    command: [
      "sh",
      "-c",
      `printf '%s' "${codeB64}" | base64 -d > /tmp/solution.js && ${lang.runCmd("/tmp/solution.js")}`,
    ],
    stdin: config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
