import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapPythonCode } from "./wrapper";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;

  // Wrap user code with I/O driver
  const wrappedCode = wrapPythonCode(config.code);

  // Base64 encode to avoid all shell escaping issues
  const codeB64 = Buffer.from(wrappedCode).toString("base64");

  // Use Python to decode base64 → write file → then run it as subprocess
  // This avoids shell printf/base64 and ensures clean file content
  const bootstrapCmd = [
    `import base64, subprocess, sys`,
    `code = base64.b64decode('${codeB64}').decode('utf-8')`,
    `with open('/tmp/solution.py', 'w') as f: f.write(code)`,
    `proc = subprocess.run([sys.executable, '/tmp/solution.py'], input=sys.stdin.buffer.read(), capture_output=True)`,
    `sys.stdout.buffer.write(proc.stdout)`,
    `sys.stderr.buffer.write(proc.stderr)`,
    `sys.exit(proc.returncode)`,
  ].join("\n");

  return runInSandbox({
    image: lang.image,
    command: ["python3", "-c", bootstrapCmd],
    stdin: JSON.stringify(config.args),
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
