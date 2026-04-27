/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode so React can switch themes by changing a class name.
  darkMode: "class",

  // Tell Tailwind where to look for class names used in the React app.
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Google Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
