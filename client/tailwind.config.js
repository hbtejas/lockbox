/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        base: '#050507',
        card: '#111118',
        border: '#1e1e2e',
        accent: '#6366f1',
        gain: '#22c55e',
        loss: '#ef4444',
        muted: '#818196',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
