import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";
import { loadFont as loadFiraSans } from "@remotion/google-fonts/FiraSans";

// Trigger font fetch at module load — Remotion waits for this before rendering.
const firaCode = loadFiraCode();
const firaSans = loadFiraSans();

export const fonts = {
  mono: firaCode.fontFamily,   // e.g. "'Fira Code', monospace"
  sans: firaSans.fontFamily,   // e.g. "'Fira Sans', sans-serif"
} as const;

export const type = {
  h1: { fontFamily: fonts.mono, fontSize: 96, fontWeight: 700, lineHeight: 1.05 },
  h2: { fontFamily: fonts.mono, fontSize: 64, fontWeight: 700, lineHeight: 1.1 },
  h3: { fontFamily: fonts.mono, fontSize: 40, fontWeight: 600, lineHeight: 1.2 },
  body: { fontFamily: fonts.sans, fontSize: 26, fontWeight: 400, lineHeight: 1.4 },
  bodySmall: { fontFamily: fonts.sans, fontSize: 20, fontWeight: 400, lineHeight: 1.35 },
  caption: { fontFamily: fonts.sans, fontSize: 22, fontWeight: 500, lineHeight: 1.3 },
  code: { fontFamily: fonts.mono, fontSize: 22, fontWeight: 400, lineHeight: 1.4 },
  codeSmall: { fontFamily: fonts.mono, fontSize: 16, fontWeight: 400, lineHeight: 1.4 },
  label: { fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, lineHeight: 1.2, letterSpacing: 1 },
} as const;
