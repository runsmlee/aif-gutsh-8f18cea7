/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#EF4444',
      },
      fontFamily: {
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
