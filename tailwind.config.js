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
        background: {
          DEFAULT: "#FFFFFF", // White
          secondary: "#F3F4F6", // Off-white/Neutral
        },
        primary: {
          DEFAULT: "#111827", // Charcoal Black
          foreground: "#FFFFFF",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        accent: {
          DEFAULT: "#D4AF37", // Gold
          foreground: "#FFFFFF",
        },
        text: {
          primary: "#111827", // Charcoal Black
          secondary: "#4B5563", // Gray
          muted: "#9CA3AF", // Light Gray
          inverted: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          light: "#F3F4F6",
        },
        card: {
          DEFAULT: "#FFFFFF",
          hover: "#F9FAFB",
        },
        // Keeping status colors but aligning them
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
