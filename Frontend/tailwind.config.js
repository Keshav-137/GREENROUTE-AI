/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0c1815',
          900: '#12231e', // Dark forest background
          850: '#162c26', // Primary card surface
          800: '#1c3730', // Elevated card / modal surface
          750: '#23453c', // Card borders
          700: '#2c574b', // Hover borders / subtle elements
          600: '#3a7263',
          500: '#4e9583',
          400: '#6ebaa7',
          300: '#8ba89f', // Secondary text
          200: '#b8d6cd',
          100: '#daf0e8',
          50: '#eff9f5',
        },
        greenroute: {
          accent: '#1a5c47',
          accentLight: '#267b5e',
          accentMuted: '#144636',
          teal: '#2f8a9d',
          tealLight: '#42a7bc',
          amber: '#d8993a',
          amberLight: '#eab055',
          riskRed: '#c0504d',
          riskRedLight: '#d96966',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

