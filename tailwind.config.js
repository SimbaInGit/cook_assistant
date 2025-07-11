/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f9f9',
          100: '#dcf0f0',
          200: '#bae4e4',
          300: '#89d1d1',
          400: '#54b9b9',
          500: '#399e9e',
          600: '#2d8080',
          700: '#286a6a',
          800: '#255656',
          900: '#244949',
        },
        secondary: {
          50: '#fdf4f8',
          100: '#fce8f1',
          200: '#fad1e3',
          300: '#f8aecb',
          400: '#f37ba6',
          500: '#eb5b89',
          600: '#d63a67',
          700: '#b3284d',
          800: '#962340',
          900: '#7e2138',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)'],
      }
    },
  },
  plugins: [],
}
