import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf6f4',
          100: '#f3ebe6',
          200: '#e6d4cb',
          300: '#d4b5a6',
          400: '#bf917c',
          500: '#a8735c',
          600: '#8f5c48',
          700: '#764a3c',
          800: '#633f35',
          900: '#54372f',
        },
        ink: {
          700: '#3a3430',
          800: '#2a2522',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px -28px rgba(84, 55, 47, 0.35)',
      },
    },
  },
  plugins: [],
}

export default config
