/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        game: {
          bg: '#F8FAFC',
          'bg-dark': '#0F172A',
          primary: {
            DEFAULT: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
          },
          secondary: {
            DEFAULT: '#F472B6',
            light: '#F9A8D4',
          }
        }
      },
      animation: {
        'bounce-small': 'bounce-small 0.3s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'title': 'title 0.5s ease-out',
      },
      keyframes: {
        'bounce-small': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'title': {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: 'class',
} 