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
        // SpeakFlow's calm, cloud-like palette
        cloud: {
          50: '#fafbfc',
          100: '#f4f6f8',
          200: '#e9ecf0',
          300: '#d3d9e0',
          400: '#b4bcc8',
          500: '#8e99a8',
          600: '#6b7684',
          700: '#525c69',
          800: '#3d4550',
          900: '#2a3038',
        },
        // Soft accent for progress and success - muted sage
        sage: {
          50: '#f6f8f6',
          100: '#e8efe8',
          200: '#d4e2d4',
          300: '#b5cfb5',
          400: '#8fb68f',
          500: '#6b9a6b',
          600: '#547d54',
          700: '#446444',
          800: '#395039',
          900: '#304230',
        },
        // Warm highlight for gentle emphasis
        warmth: {
          50: '#fdfaf7',
          100: '#faf4eb',
          200: '#f5e8d5',
          300: '#edd7b8',
          400: '#e2c092',
          500: '#d4a66b',
          600: '#c28d50',
          700: '#a27343',
          800: '#835c3b',
          900: '#6b4c33',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe-in': 'breatheIn 6s cubic-bezier(0.4, 0, 0.2, 1)',
        'breathe-out': 'breatheOut 8s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-delay': 'fadeIn 0.6s ease-out 0.2s both',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-up-delay-1': 'slideUp 0.5s ease-out 0.1s both',
        'slide-up-delay-2': 'slideUp 0.5s ease-out 0.2s both',
        'slide-up-delay-3': 'slideUp 0.5s ease-out 0.3s both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in-delay': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(0.7)', opacity: '0.5' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'scale(0.7)', opacity: '0.5' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'ease-gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config
