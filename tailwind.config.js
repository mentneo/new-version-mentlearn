/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#EBF5FF',
          100: '#E1EFFE',
          200: '#C3DDFD',
          300: '#A4CAFÉ',
          400: '#76A9FA',
          500: '#4C6EF5', // Updated to match logo
          600: '#3F56EA', // Updated to match logo
          700: '#2638CA', // Updated to match logo
          800: '#1E2FA3',
          900: '#1A237E',
        },
        // ...other colors
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
