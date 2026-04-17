import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapJavaScriptCode } from "./wrapper";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  // Wrap user code with I/O driver
  const wrappedCode = wrapJavaScriptCode(config.code);

  // Base64 encode to avoid shell escaping issues
  const codeB64 = Buffer.from(wrappedCode).toString("base64");

  // Use Node.js to decode base64 → write file → then run it as child process
  const bootstrapCmd = [
    `const fs = require('fs');`,
    `const { execSync } = require('child_process');`,
    `const code = Buffer.from('${codeB64}', 'base64').toString('utf-8');`,
    `fs.writeFileSync('/tmp/solution.js', code);`,
    `try {`,
    `  const result = execSync('node /tmp/solution.js', { input: fs.readFileSync('/dev/stdin'), stdio: ['pipe', 'pipe', 'pipe'] });`,
    `  process.stdout.write(result);`,
    `} catch (e) {`,
    `  if (e.stdout) process.stdout.write(e.stdout);`,
    `  if (e.stderr) process.stderr.write(e.stderr);`,
    `  process.exit(e.status || 1);`,
    `}`,
  ].join("\n");

  return runInSandbox({
    image: lang.image,
    command: ["node", "-e", bootstrapCmd],
    stdin: JSON.stringify(config.args),
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
