import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapJavaScriptCode } from "./wrapper";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  // Wrap user code with I/O driver
  const wrappedCode = wrapJavaScriptCode(config.code);
  const codeB64 = Buffer.from(wrappedCode).toString("base64");

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
