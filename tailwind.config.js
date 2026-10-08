/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'demon-bg': '#0b0b0f',
        'demon-dark': '#0e1015',
        'demon-card': '#111318',
        'demon-border': '#242830',
        'demon-red': '#ff0000',
        'demon-blood': '#8d1a1a',
        'demon-crimson': '#ff4d4d',
        'demon-amber': '#ffaa00',
        'demon-cyan': '#00d2ff',
        'demon-gold': '#c26b3a',
      },
      fontFamily: {
        'rocker': ['"New Rocker"', 'cursive'],
        'metal': ['"Metal Mania"', 'cursive'],
        'pirata': ['"Pirata One"', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'demon-glow': '0 0 25px rgba(255, 0, 0, 0.4)',
        'demon-blood': '0 0 35px rgba(141, 26, 26, 0.5)',
        'demon-cyan': '0 0 25px rgba(0, 210, 255, 0.4)',
        'demon-gold': '0 0 25px rgba(194, 107, 58, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 10px #ff0000)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px #ff4d4d)' },
        },
        bloodDrip: {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(110%)', opacity: '0' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'blood-drip': 'bloodDrip 5s linear infinite',
      }
    },
  },
  plugins: [],
}
