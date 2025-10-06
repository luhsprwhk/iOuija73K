import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx,svelte}", "./pages/**/*.{js,jsx,ts,tsx,svelte}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          darkBg: { value: '#0d0d1a' },
          darkPanel: { value: '#16161f' },
          darkCard: { value: '#1a1a2e' },
          darkBorder: { value: '#2a2a3e' },
          bloodRed: { value: '#8b0000' },
          bloodRedHover: { value: '#a00000' },
          textPrimary: { value: '#e0e0e0' },
          textSecondary: { value: '#c9c9d4' },
          textMuted: { value: '#666' },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
});
