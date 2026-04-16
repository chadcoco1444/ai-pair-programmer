import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  return runInSandbox({
    image: lang.image,
    command: ["sh", "-c", `cat > /tmp/solution.js && ${lang.runCmd("/tmp/solution.js")}`],
    stdin: config.code + "\n---STDIN---\n" + config.input,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
