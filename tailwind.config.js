/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      textShadow: {
        green: '0 0 8px rgba(26, 92, 26, 0.6)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        masters: {
          green: '#1a5c1a',
          gold: '#b49b57',
        },
      },
      keyframes: {
        loadingBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        loadingBar: 'loadingBar 1.8s ease-in-out'
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-green': {
          textShadow: '0 0 8px rgba(26, 92, 26, 0.6)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 