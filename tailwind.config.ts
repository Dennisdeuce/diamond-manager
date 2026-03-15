import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#8B99B3',
          300: '#51668D',
          400: '#2E4470',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070A19',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F3',
          200: '#F5F0E8',
          300: '#EDE5D6',
          400: '#E2D6C0',
        },
        accent: {
          red: '#C8102E',
          redLight: '#E8394F',
          redDark: '#9E0C24',
        },
        field: {
          green: '#2D5A27',
          greenLight: '#3E7A35',
          dirt: '#C4A265',
          dirtLight: '#D4BA85',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
