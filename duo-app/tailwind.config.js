/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#D4537E',
          light: '#FBEAF0',
          mid: '#ED93B1',
          dark: '#72243E',
        },
        teal: {
          DEFAULT: '#1D9E75',
          light: '#E1F5EE',
          dark: '#085041',
        },
        ink: {
          DEFAULT: '#1a1118',
          soft: '#3d2d38',
        },
        muted: '#7a6872',
        surface: '#fdfbfc',
        card: '#ffffff',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        element: '12px',
        pill: '99px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(212,83,126,0.08)',
        rose: '0 4px 20px rgba(212,83,126,0.12)',
      },
    },
  },
  plugins: [],
};
