/** @type {import('tailwindcss').Config} */

const rgb = (r, g, b) => `rgb(${r} ${g} ${b} / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: rgb(10, 10, 10),
          50: rgb(245, 241, 234),
          100: rgb(232, 226, 214),
          200: rgb(201, 192, 176),
          300: rgb(154, 145, 130),
          400: rgb(107, 99, 87),
          500: rgb(61, 56, 49),
          600: rgb(42, 38, 32),
          700: rgb(26, 24, 20),
          800: rgb(18, 16, 12),
          900: rgb(10, 10, 10),
        },
        cream: {
          DEFAULT: rgb(245, 241, 234),
          50: rgb(251, 249, 244),
          100: rgb(245, 241, 234),
          200: rgb(234, 227, 212),
          300: rgb(222, 212, 190),
          400: rgb(207, 194, 164),
        },
        gold: {
          DEFAULT: rgb(184, 149, 106),
          50: rgb(245, 239, 230),
          100: rgb(232, 222, 201),
          200: rgb(213, 194, 158),
          300: rgb(196, 166, 116),
          400: rgb(184, 149, 106),
          500: rgb(154, 122, 81),
          600: rgb(124, 96, 64),
        },
        moss: {
          DEFAULT: rgb(61, 90, 69),
          50: rgb(237, 242, 236),
          100: rgb(214, 225, 213),
          200: rgb(173, 194, 171),
          300: rgb(117, 152, 115),
          400: rgb(61, 90, 69),
          500: rgb(46, 69, 53),
        },
        terracotta: {
          DEFAULT: rgb(139, 74, 58),
          50: rgb(243, 231, 227),
          100: rgb(230, 207, 199),
          200: rgb(204, 155, 141),
          300: rgb(171, 99, 80),
          400: rgb(139, 74, 58),
          500: rgb(107, 56, 43),
        },
        slate: {
          DEFAULT: rgb(91, 123, 140),
          50: rgb(238, 242, 244),
          100: rgb(217, 226, 231),
          200: rgb(178, 196, 206),
          300: rgb(133, 163, 178),
          400: rgb(91, 123, 140),
          500: rgb(68, 95, 110),
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      borderRadius: {
        gallery: "2px",
      },
      boxShadow: {
        gallery: "0 1px 3px rgba(10, 10, 10, 0.08), 0 1px 2px rgba(10, 10, 10, 0.04)",
        "gallery-lg": "0 10px 40px rgba(10, 10, 10, 0.12), 0 2px 8px rgba(10, 10, 10, 0.06)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 149, 106, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(184, 149, 106, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
