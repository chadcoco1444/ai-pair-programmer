import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type Provider = "anthropic" | "google" | "openai";

const DEFAULT_PROVIDER: Provider = "anthropic";

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  google: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
};

function resolveProvider(): Provider {
  const raw = process.env.AI_PROVIDER?.toLowerCase().trim();
  if (raw === "anthropic" || raw === "openai") return raw;
  if (raw === "google" || raw === "gemini") return "google";
  return DEFAULT_PROVIDER;
}

function apiKeyFor(provider: Provider): string | undefined {
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY;
  if (provider === "google") {
    return (
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY
    );
  }
  return process.env.OPENAI_API_KEY;
}

function modelIdFor(provider: Provider): string {
  if (provider === "anthropic")
    return process.env.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic;
  if (provider === "google")
    return process.env.GEMINI_MODEL || DEFAULT_MODELS.google;
  return process.env.OPENAI_MODEL || DEFAULT_MODELS.openai;
}

export const AI_PROVIDER: Provider = resolveProvider();
export const AI_MODEL: string = modelIdFor(AI_PROVIDER);
export const AI_AVAILABLE: boolean = Boolean(apiKeyFor(AI_PROVIDER));

export function getModel(): LanguageModel {
  const apiKey = apiKeyFor(AI_PROVIDER);
  if (!apiKey) {
    throw new Error(
      `AI provider "${AI_PROVIDER}" is selected but no API key is set. ` +
        `Set one of: ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY), OPENAI_API_KEY. ` +
        `Switch providers via AI_PROVIDER=anthropic|google|openai in .env.`
    );
  }

  switch (AI_PROVIDER) {
    case "anthropic":
      return createAnthropic({ apiKey })(AI_MODEL);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(AI_MODEL);
    case "openai":
      return createOpenAI({ apiKey })(AI_MODEL);
  }
}
