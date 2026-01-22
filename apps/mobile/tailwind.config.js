/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
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
    },
  },
  plugins: [],
};
