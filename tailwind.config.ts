import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        foreground: 'var(--foreground)',
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        ink: {
          DEFAULT: '#09090b',
          muted: '#71717a',
        },
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      boxShadow: {
        'modern': '0 0 50px -12px rgb(0 0 0 / 0.05)',
        'modern-hover': '0 0 50px -12px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;
