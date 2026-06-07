import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7f5",
          100: "#e8ede9",
          200: "#d0dcd2",
          300: "#adc2b0",
          400: "#83a387",
          500: "#638669",  // primary sage green
          600: "#4e6b54",
          700: "#405645",
          800: "#364639",
          900: "#2d3a30",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        widget: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
