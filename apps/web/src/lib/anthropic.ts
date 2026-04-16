import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const AI_AVAILABLE = Boolean(process.env.ANTHROPIC_API_KEY);

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key",
  });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

export const AI_MODEL = "claude-sonnet-4-20250514";
