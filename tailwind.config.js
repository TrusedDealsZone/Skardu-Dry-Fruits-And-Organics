/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f2',
          100: '#f5edd9',
          200: '#ebd7b0',
          300: '#deb980',
          400: '#d19854',
          500: '#c27c32',
          600: '#a76127',
          700: '#874a23',
          800: '#6f3d23',
          900: '#5c3320',
        },
        organic: {
          50: '#f2fbf4',
          100: '#e0f6e6',
          200: '#c3eccf',
          300: '#95dbaa',
          400: '#5ec27f',
          500: '#38a65c',
          600: '#2a8547',
          700: '#23693a',
          800: '#205431',
          900: '#1b452a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
