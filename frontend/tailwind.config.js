/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'podar-blue': {
          50: '#e6f0fa',
          100: '#cce1f5',
          200: '#99c3eb',
          300: '#66a5e1',
          400: '#3387d7',
          500: '#0069cd',
          600: '#0054a4',
          700: '#003f7b',
          800: '#002a52',
          900: '#001529',
        },
        'podar-gold': {
          50: '#fef8e7',
          100: '#fdf1cf',
          200: '#fbe39f',
          300: '#f9d56f',
          400: '#f7c73f',
          500: '#f5b90f',
          600: '#c4940c',
          700: '#936f09',
          800: '#624a06',
          900: '#312503',
        }
      },
      fontFamily: {
        'podar': ['Poppins', 'sans-serif'],
      },
      // ✅ ADDED: Animations for Rules Modal
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}