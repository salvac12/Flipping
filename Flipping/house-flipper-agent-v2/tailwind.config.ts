import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Figma Design System Colors
        primary: {
          DEFAULT: '#155DFC',
          dark: '#0D3FC5',
          light: '#DBEAFE',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#00A63E',
          foreground: '#FFFFFF',
        },
        background: '#F9FAFB',
        foreground: '#0A0A0A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0A0A0A',
        },
        border: 'rgba(0, 0, 0, 0.1)',
        input: '#F3F3F5',
        ring: '#155DFC',
        text: {
          primary: '#101828',
          secondary: '#4A5565',
          tertiary: '#364153',
        },
        muted: {
          DEFAULT: '#F3F3F5',
          foreground: '#4A5565',
        },
        accent: {
          DEFAULT: '#EFF6FF',
          foreground: '#155DFC',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#ECECF0',
          foreground: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'heading-1': ['30px', { lineHeight: '1.2', letterSpacing: '0.01318em' }],
        'heading-2': ['20px', { lineHeight: '1.4', letterSpacing: '-0.02246em' }],
        'body': ['16px', { lineHeight: '1.5', letterSpacing: '-0.01953em' }],
        'body-sm': ['14px', { lineHeight: '1.429', letterSpacing: '-0.01074em' }],
        'caption': ['12px', { lineHeight: '1.333' }],
      },
      borderRadius: {
        card: '14px',
        button: '8px',
        input: '8px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
        header: '0px 1px 2px -1px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
