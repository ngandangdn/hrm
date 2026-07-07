/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // Keep Ant Design's component baseline intact; Tailwind utilities are used for layout only.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        hicas: {
          primary: '#3f2be8',
          primarySoft: '#eef0ff',
          border: '#c8c4dc',
          text: '#111827',
          muted: '#6b7280',
          page: '#f7f6f3',
        },
      },
      borderRadius: {
        hicas: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        hicas: '0 18px 40px rgba(31, 28, 79, 0.16)',
      },
    },
  },
  plugins: [],
};
