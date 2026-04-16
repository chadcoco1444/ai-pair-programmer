import { GoogleGenerativeAI } from "@google/generative-ai";

const globalForAI = globalThis as unknown as {
  genai: GoogleGenerativeAI | undefined;
};

export const AI_AVAILABLE = Boolean(process.env.GEMINI_API_KEY);

export const genai =
  globalForAI.genai ??
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

if (process.env.NODE_ENV !== "production") {
  globalForAI.genai = genai;
}

export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
