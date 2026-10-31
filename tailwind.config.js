/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("bg"),
        surface: token("surface"),
        raised: token("raised"),
        line: "rgb(var(--line) / 0.08)",
        ink: token("text"),
        muted: token("muted"),
        brand: token("brand"),
        "on-brand": token("brand-ink"),
        pos: token("pos"),
        neg: token("neg"),
        warn: token("warn"),
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
  darkMode: "class", // Enable class-based dark mode
};
