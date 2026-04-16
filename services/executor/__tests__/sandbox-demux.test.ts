import { describe, it, expect } from "vitest";

/**
 * REGRESSION: Docker logs demux
 *
 * Bug: container.logs() returns multiplexed stream with 8-byte headers
 * per frame. Previously we did logs.toString("utf-8") which included
 * binary header bytes in the output, causing output comparison to
 * ALWAYS fail (Wrong Answer even with correct code).
 *
 * Fix: demuxDockerLogs() properly parses the multiplexed format.
 */

// Re-implement demux for testing (same logic as sandbox.ts)
function demuxDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      stdout += buffer.subarray(offset).toString("utf-8");
      break;
    }

    const streamType = buffer[offset];
    const frameSize = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + frameSize > buffer.length) {
      const chunk = buffer.subarray(offset).toString("utf-8");
      if (streamType === 2) stderr += chunk;
      else stdout += chunk;
      break;
    }

    const chunk = buffer.subarray(offset, offset + frameSize).toString("utf-8");
    if (streamType === 2) stderr += chunk;
    else stdout += chunk;
    offset += frameSize;
  }

  return { stdout, stderr };
}

function makeDockerFrame(streamType: number, content: string): Buffer {
  const payload = Buffer.from(content, "utf-8");
  const header = Buffer.alloc(8);
  header[0] = streamType; // 1=stdout, 2=stderr
  header.writeUInt32BE(payload.length, 4);
  return Buffer.concat([header, payload]);
}

describe("demuxDockerLogs", () => {
  it("should extract stdout from a single frame", () => {
    const frame = makeDockerFrame(1, "[0,1]\n");
    const { stdout, stderr } = demuxDockerLogs(frame);
    expect(stdout).toBe("[0,1]\n");
    expect(stderr).toBe("");
  });

  it("should extract stderr from a single frame", () => {
    const frame = makeDockerFrame(2, "error: something\n");
    const { stdout, stderr } = demuxDockerLogs(frame);
    expect(stdout).toBe("");
    expect(stderr).toBe("error: something\n");
  });

  it("should handle multiple stdout frames", () => {
    const frame1 = makeDockerFrame(1, "hello ");
    const frame2 = makeDockerFrame(1, "world\n");
    const buffer = Buffer.concat([frame1, frame2]);
    const { stdout } = demuxDockerLogs(buffer);
    expect(stdout).toBe("hello world\n");
  });

  it("should separate stdout and stderr", () => {
    const out = makeDockerFrame(1, "result\n");
    const err = makeDockerFrame(2, "warning: unused\n");
    const buffer = Buffer.concat([out, err]);
    const { stdout, stderr } = demuxDockerLogs(buffer);
    expect(stdout).toBe("result\n");
    expect(stderr).toBe("warning: unused\n");
  });

  it("should handle empty output", () => {
    const frame = makeDockerFrame(1, "");
    const { stdout } = demuxDockerLogs(frame);
    expect(stdout).toBe("");
  });

  it("REGRESSION: raw toString would include binary headers", () => {
    const frame = makeDockerFrame(1, "true\n");
    // The old buggy approach:
    const rawString = frame.toString("utf-8");
    // rawString contains binary garbage + "true\n"
    expect(rawString).not.toBe("true\n"); // This PROVES the old approach was wrong

    // The fixed approach:
    const { stdout } = demuxDockerLogs(frame);
    expect(stdout).toBe("true\n"); // This is correct
  });

  it("should handle multi-line output", () => {
    const frame = makeDockerFrame(1, '["eat","oath"]\n');
    const { stdout } = demuxDockerLogs(frame);
    expect(stdout).toBe('["eat","oath"]\n');
  });

  it("should handle incomplete frames gracefully", () => {
    const frame = makeDockerFrame(1, "partial");
    // Truncate the frame
    const truncated = frame.subarray(0, frame.length - 2);
    const { stdout } = demuxDockerLogs(truncated);
    expect(stdout).toContain("parti"); // Should get partial content, not crash
  });
});
