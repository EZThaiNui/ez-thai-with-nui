/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'system-ui', 'sans-serif'],
        thai: ['Sarabun', '"Noto Sans Thai"', '"Mali"', 'sans-serif'],
        mali: ['Mali', '"Noto Sans Thai"', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        brand: {
          blue: '#7cc9f5',
          orange: '#ffbd59'
        }
      }
    }
  },
  plugins: []
};
