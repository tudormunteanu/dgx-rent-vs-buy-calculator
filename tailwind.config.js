/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './index.tsx'],
  theme: {
    extend: {
      colors: {
        dark: 'rgb(var(--dark) / <alpha-value>)',
        light: 'rgb(var(--light) / <alpha-value>)',
        neutral: {
          50: 'rgb(var(--neutral-50) / <alpha-value>)',
          100: 'rgb(var(--neutral-100) / <alpha-value>)',
          200: 'rgb(var(--neutral-200) / <alpha-value>)',
          300: 'rgb(var(--neutral-300) / <alpha-value>)',
          400: 'rgb(var(--neutral-400) / <alpha-value>)',
          500: 'rgb(var(--neutral-500) / <alpha-value>)',
          600: 'rgb(var(--neutral-600) / <alpha-value>)',
          700: 'rgb(var(--neutral-700) / <alpha-value>)',
          800: 'rgb(var(--neutral-800) / <alpha-value>)',
          900: 'rgb(var(--neutral-900) / <alpha-value>)',
          1000: 'rgb(var(--neutral-1000) / <alpha-value>)',
          1100: 'rgb(var(--neutral-1100) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
