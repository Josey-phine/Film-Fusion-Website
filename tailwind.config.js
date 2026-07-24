/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        slate: '#1E293B',
        pink: '#F472B6',
        cyan: '#06B6D4',
      }
    },
  },
  plugins: [],
}