/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark theme colors based on design
        background: {
          DEFAULT: "#0a0a0a",
          secondary: "#121212",
          tertiary: "#1a1a1a",
        },
        card: {
          DEFAULT: "#1a1a1a",
          secondary: "#1e1e1e",
          hover: "#222222",
        },
        border: {
          DEFAULT: "#2a2a2a",
          light: "#333333",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0a0",
          tertiary: "#6a6a6a",
          muted: "#4a4a4a",
        },
        primary: {
          DEFAULT: "#8b5cf6",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          pink: "#ec4899",
          green: "#10b981",
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#4ade80",
          dark: "#16a34a",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["System"],
        mono: ["Courier"],
      },
    },
  },
  plugins: [],
};
