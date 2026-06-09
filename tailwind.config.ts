import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#166534',
        'primary-light': '#F0FDF4',
        'secondary': '#F59E0B',
        'accent': '#3B82F6',
        'danger': '#EF4444',
        'success': '#10B981',
        'whatsapp': '#25D366',
      },
      fontFamily: {
        'sans': ['DM Sans', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
