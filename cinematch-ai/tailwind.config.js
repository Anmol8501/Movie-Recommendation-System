/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#E50914',
        },
        purple: {
          DEFAULT: '#7C3AED',
        },
        dark: {
          DEFAULT: '#0a0a0a',
        },
        card: {
          DEFAULT: '#111111',
        },
        surface: {
          DEFAULT: '#1a1a1a',
        },
        muted: {
          DEFAULT: '#999999',
        },
        text: {
          DEFAULT: '#f0f0f0',
        }
      },
      fontFamily: {
        title: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      borderColor: {
        default: 'rgba(255,255,255,0.08)',
      }
    },
  },
  plugins: [],
}
