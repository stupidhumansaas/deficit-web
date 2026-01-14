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
        // Exact colors from the iOS app Theme.swift
        primary: '#ff382e',
        background: '#000000',
        'off-black': '#111111',
        stone: {
          dark: '#1c1c1c',
          'dark-half': '#0a0a0a',
        },
        gray: {
          400: '#666666',
          500: '#6b7280',
          600: '#4b5563',
          700: '#383b40',
          800: '#262a2e',
        },
        success: '#34C759',
        warning: '#FF9500',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'wide': '0.1em',
        'wider': '0.15em',
        'widest': '0.2em',
      },
    },
  },
  plugins: [],
}
export default config
