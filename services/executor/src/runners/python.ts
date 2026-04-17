import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapPythonCode } from "./wrapper";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;

  // Wrap user code with I/O driver
  const wrappedCode = wrapPythonCode(config.code);

  // Base64 encode both code and args to avoid shell escaping and stdin race conditions
  const codeB64 = Buffer.from(wrappedCode).toString("base64");
  const argsB64 = Buffer.from(JSON.stringify(config.args)).toString("base64");

  // Bootstrap: decode code + args via base64, write code to file, pass args as stdin to subprocess
  // This avoids Docker stdin piping race conditions by embedding args in the command
  const bootstrapCmd = [
    `import base64, subprocess, sys`,
    `code = base64.b64decode('${codeB64}').decode('utf-8')`,
    `args_json = base64.b64decode('${argsB64}')`,
    `with open('/tmp/solution.py', 'w') as f: f.write(code)`,
    `proc = subprocess.run([sys.executable, '/tmp/solution.py'], input=args_json, capture_output=True)`,
    `sys.stdout.buffer.write(proc.stdout)`,
    `sys.stderr.buffer.write(proc.stderr)`,
    `sys.exit(proc.returncode)`,
  ].join("\n");

  return runInSandbox({
    image: lang.image,
    command: ["python3", "-c", bootstrapCmd],
    stdin: "",
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
