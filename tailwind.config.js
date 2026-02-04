/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /bg-lefitness-bubbleUser/ },
  ],
  theme: {
    extend: {
      colors: {
        lefitness: {
          bg: "#212121",
          header: "#181818",
          inputBar: "#303030",
          inputBox: "#303030",
          bubbleBot: "#343541",
          bubbleUser: "#303030",
          pill: "#333333",
          muted: "#8e8ea0",
          text: "#ececf1",
          sendHover: "#e5e5e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
