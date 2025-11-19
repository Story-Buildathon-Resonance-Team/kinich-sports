// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kinich design system colors
        graphite: {
          DEFAULT: "#2C2C2E",
          dark: "#1A1A1C",
          mid: "#1A1A2E",
        },
        ice: "#F5F7FA",
        "icy-cobalt": "#B8D4F0",
        cobalt: {
          DEFAULT: "#0047AB",
          deep: "#0056D6",
        },
        "kinetic-orange": "#FF6B35",
        "input-dark": "#3A3A3C",
        "input-focus": "#424244",
      },
      fontFamily: {
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SF Mono", "Consolas", "Monaco", "monospace"],
      },
      spacing: {
        "space-xs": "4px",
        "space-sm": "8px",
        "space-md": "16px",
        "space-lg": "24px",
        "space-xl": "32px",
        "space-2xl": "48px",
        "space-3xl": "64px",
        "space-4xl": "80px",
        "space-5xl": "120px",
      },
      borderRadius: {
        "radius-sm": "8px",
        "radius-md": "10px",
        "radius-lg": "12px",
        "radius-xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
