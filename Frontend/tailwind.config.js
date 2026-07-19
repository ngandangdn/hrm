/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hicas: {
          primary: '#4338ca',
          primarySoft: '#eef2ff',
          border: '#d7d4ea',
          muted: '#64748b',
          ink: '#0f172a',
          surface: '#f8fafc',
        },
      },
      boxShadow: {
        hicas: '0 14px 30px rgba(67, 56, 202, 0.16)',
      },
    },
  },
  plugins: [],
};
