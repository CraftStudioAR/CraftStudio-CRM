/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          cream: '#FEFAF9',
          red: '#a52f18',
          ink: '#000000',
          navy: '#0a0424',
          surface: '#FFFFFF',
          border: '#E8E3E1',
          hover: '#F5EFEF',
          muted: '#666666',
        }
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
