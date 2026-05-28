module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        okta: ["OktaNeue", "sans-serif"],
        vga: ["DOSVGA", "monospace"],
      },

      keyframes: {
        newZoom: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
        },
      },

      animation: {
        test: "spin 1s linear infinite",
      },
    },
  },

  plugins: [],
};