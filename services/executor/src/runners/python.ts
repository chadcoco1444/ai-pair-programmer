import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;

  return runInSandbox({
    image: lang.image,
    command: ["sh", "-c", `cat > /tmp/solution.py && ${lang.runCmd("/tmp/solution.py")}`],
    stdin: config.code + "\n---STDIN---\n" + config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
