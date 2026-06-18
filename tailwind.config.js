/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#030d06',
          900: '#071409',
          850: '#0a1a0e',
          800: '#0e2315',
          750: '#122c1b',
          700: '#173522',
          600: '#1f4a2e',
          500: '#28613c',
          400: '#337a4a',
        },
        neon: {
          green: '#39d353',
          lime: '#22c55e',
          bright: '#4ade80',
          dim: '#16a34a',
          glow: '#86efac',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulse_slow: 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        scan: 'scan 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #39d353, 0 0 10px #39d353' },
          '100%': { boxShadow: '0 0 15px #39d353, 0 0 30px #39d353, 0 0 60px #39d35340' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-green': 'linear-gradient(rgba(57,211,83,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.05) 1px, transparent 1px)',
        'radial-green': 'radial-gradient(ellipse at center, rgba(57,211,83,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
