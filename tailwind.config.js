/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          dark: '#0f0f0f',
          panel: '#1a1a1a',
          accent: '#7c3aed',
          text: '#e5e5e5'
        }
      },
      fontFamily: {
        'game': ['Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
