/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        moked: {
          crimson: "#c8102e",
          crimsonDeep: "#9e0b22",
          ink: "#0b1220",
          inkSoft: "#1a2236",
          muted: "#5b6477",
          bg: "#f6f7fb",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Manrope"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

