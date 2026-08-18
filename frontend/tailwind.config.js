/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [
    require('nativewind/preset'),
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F59E0B',
          light: '#FFD66B',
          dark: '#C96A05',
        },

        background: '#FFF9EF',

        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FFF1CF',
        },

        foreground: '#2A1D0B',
        muted: '#766755',
        border: '#EAD5AA',

        success: '#2F855A',
        warning: '#D97706',
        error: '#C2413B',
      },
    },
  },

  plugins: [],
};