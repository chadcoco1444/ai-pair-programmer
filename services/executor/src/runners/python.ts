import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapPythonCode } from "./wrapper";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;

  // Wrap user code with I/O driver
  const wrappedCode = wrapPythonCode(config.code);
  const codeB64 = Buffer.from(wrappedCode).toString("base64");

  return runInSandbox({
    image: lang.image,
    command: [
      "sh",
      "-c",
      `printf '%s' "${codeB64}" | base64 -d > /tmp/solution.py && ${lang.runCmd("/tmp/solution.py")}`,
    ],
    stdin: config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
