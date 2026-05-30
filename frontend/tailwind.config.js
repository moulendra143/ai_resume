export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.12)",
        surface: "rgba(15, 23, 42, 0.8)",
        accent: "#7C3AED",
        accentSoft: "#8B5CF6",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.18)",
      }
    },
  },
  plugins: [],
};
