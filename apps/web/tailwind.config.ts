import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skill: {
          green: "#22c55e",
          yellow: "#f59e0b",
          red: "#ef4444",
          gray: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
