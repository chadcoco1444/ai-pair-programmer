import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapJavaScriptCode } from "./wrapper";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;

  // Wrap user code with I/O driver
  const wrappedCode = wrapJavaScriptCode(config.code);

  // Base64 encode both code and args to avoid shell escaping and stdin race conditions
  const codeB64 = Buffer.from(wrappedCode).toString("base64");
  const argsB64 = Buffer.from(JSON.stringify(config.args)).toString("base64");

  // Bootstrap: decode code + args via base64, write code to file, pass args as stdin
  const bootstrapCmd = [
    `const fs = require('fs');`,
    `const { execSync } = require('child_process');`,
    `const code = Buffer.from('${codeB64}', 'base64').toString('utf-8');`,
    `const argsJson = Buffer.from('${argsB64}', 'base64');`,
    `fs.writeFileSync('/tmp/solution.js', code);`,
    `try {`,
    `  const result = execSync('node /tmp/solution.js', { input: argsJson, stdio: ['pipe', 'pipe', 'pipe'] });`,
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
    stdin: "",
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
