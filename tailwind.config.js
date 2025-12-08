/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hunter: {
          dark: '#0b0c10',
          card: '#1f2833',
          green: '#66fcf1',
          dimGreen: '#45a29e',
          red: '#ff003c' // للـ Boss Fights
        }
      },
      fontFamily: {
        'anime': ['Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
