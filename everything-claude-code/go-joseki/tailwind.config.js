/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: '#E8D5B5',
          line: '#5D4037',
          star: '#3E2723',
        },
        stone: {
          black: '#2B2B2B',
          white: '#F0F0F0',
        },
        ogs: {
          bg: '#F5F5F5',
          card: '#FFFFFF',
          text: '#333333',
          muted: '#666666',
          accent: '#1A6B9C',
          border: '#DDDDDD',
        }
      }
    },
  },
  plugins: [],
}
