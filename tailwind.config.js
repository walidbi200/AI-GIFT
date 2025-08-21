// FILE: walidbi200/ai-gift/AI-GIFT-2fef8f469c6596d3b301b2142f1edcc9f74af4b0/tailwind.config.js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        display: ["Poppins", "sans-serif"],
      },
      colors: {
        // Light Mode Colors
        "light-background": "#FFFFFF",
        "light-surface": "#F9FAFB",
        "light-primary": "#471396", // Dark Purple
        "light-accent": "#FFCC00", // Yellow
        "light-text-primary": "#111827",
        "light-text-muted": "#6B7280",
        "light-border": "#E5E7EB",

        // Dark Mode Colors (New Palette)
        "dark-background": "#090040", // Dark Navy
        "dark-surface": "#471396", // Dark Purple
        "dark-primary": "#B13BFF", // Bright Violet
        "dark-accent": "#FFCC00", // Yellow
        "dark-text-primary": "#F9FAFB",
        "dark-text-muted": "#A1A7B2",
        "dark-border": "#471396", // Dark Purple

        // Utility Colors
        success: "#10B981",
        "dark-success": "#34D399",
        error: "#EF4444",
        "dark-error": "#F87171",

        // Custom Palette
        primary: "#4A90E2", // Cornflower Blue: for CTAs, links
        secondary: "#F5A623", // Goldenrod: for accents, highlights
        background: "#F8F9FA", // Alabaster: for main page backgrounds
        surface: "#FFFFFF", // White: for cards, modals
        "text-primary": "#212529", // Onyx: for main text
        "text-secondary": "#6C757D", // Abbey: for subtitles, descriptions
        border: "#DEE2E6", // Light Gray: for borders, dividers
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        large:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
