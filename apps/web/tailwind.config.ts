import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Pure white (use default white)
        // Accents: Soft sky blues
        sky: {
          50: '#F5F9FD',
          100: '#E8F4FD', // User specified
          200: '#D0E4F5',
          300: '#B8D4E8', // User specified
          400: '#9BC3DE',
          500: '#7FB3D3', // User specified
          600: '#6492B0',
          700: '#4A728D',
          800: '#32536B',
          900: '#1D3548',
        },
        // Warmth/Safe: Gentle sage greens
        sage: {
          50: '#F2F6F2',
          100: '#E8F0E8', // User specified
          200: '#D6E4D6',
          300: '#C5D9C5', // User specified
          400: '#A3C2A3',
          500: '#82AB82',
          600: '#648A64',
          700: '#486848',
          800: '#2E472E',
          900: '#172617',
        },
        // Text/Cloud colors (neutrals, but cool toned)
        cloud: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe-in': 'breatheIn 6s cubic-bezier(0.4, 0, 0.2, 1)',
        'breathe-out': 'breatheOut 8s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0.6' },
          '50%': { opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { opacity: '0.9' },
          '100%': { transform: 'scale(0.85)', opacity: '0.6' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(0.98)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '2000': '2000ms',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
export default config
