/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        dark: {
          100: '#1F2937',
          200: '#111827',
          300: '#0F172A',
          400: '#0D1117',
        },
        accent: {
          blue: '#60A5FA',
          purple: '#A78BFA',
          pink: '#F472B6',
        },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom right,rgb(33, 47, 66),rgb(5, 20, 53))',
        'gradient-glow': 'linear-gradient(to bottom right, rgba(89, 214, 252, 0.3), rgba(167, 139, 250, 0.3))',
      },
    },
  },
  plugins: [],
} 