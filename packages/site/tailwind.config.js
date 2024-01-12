/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        sky: '#006CF6',
        snow: '#FFFFFF',
        lightSky: '#358CFA',
        gray: {
          50: '#AEB5BC',
          100: '#9094A4',
          200: '#7C808C',
          300: '#46505A',
          400: '#313E4B',
          500: '#213345',
          600: '#111A22',
        },
        whiteGray: 'rbga(255, 255, 255, 0.2)',
        orange: '#F3A205',
        raspberry: '#F53F96',
        grapefruit: '#FB5522',
        blueberry: '#2EB6D4',
        brightBlueberry: '#32CAEB',
        red: '#F04B4B',
        green: '#5FC346',
        disabledNightBlue: '#1F518C',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gray-glass-90':
          'linear-gradient(90deg, rgba(43, 55, 65, 0.7) 0%, rgba(37, 48, 58, 0.6) 62.55%, rgba(26, 37, 48, 0.7) 100%)',
        'orange-fog':
          'linear-gradient(294deg,#675636 0%,#986921 27.83%,#f69400 88.56%)',
        'blue-fog':
          'linear-gradient(294deg,#2f5071 0%,#2f63aa 34.89%,#1543e7 97.58%)',
        'light-glass-70':
          'linear-gradient(90deg,rgba(43, 55, 65, 0.7) 0%,rgba(37, 48, 58, 0.6) 62.55%,rgba(26, 37, 48, 0.7) 100%)',
        night: 'linear-gradient(131deg, #111a22 25.72%, #213345 66.51%)',
        'blueberry-fog':
          'linear-gradient(310deg,#25647c 10.92%,#17abac 51.61%,#03f4cf 84.76%)',
        'gray-glass':
          'linear-gradient(158deg,rgba(57, 70, 82, 0.9) 0%,rgba(17, 26, 34, 0.18) 66.02%,rgba(28, 42, 54, 0.9) 99.69%)',
        'light-glass':
          'linear-gradient(90deg,rgba(43, 55, 65, 0.7) 0%,rgba(37, 48, 58, 0.6) 62.55%,rgba(26, 37, 48, 0.7) 100%)',
        'black-gradient':
          'linear-gradient(180deg,rgba(0, 0, 0, 0.14) 0%,rgba(0, 0, 0, 0.3) 73.39%)',
        rainbow:
          'linear-gradient(294deg,#f64a14 0%, #ff9519 14.26%, #f5c518 26.07%, #e3db1c 34.81%, #abec1f 41.92%, #60ea1f 50.2%, #1feb58 57.99%, #1ed869 66.89%, #22b09f 75.22%, #1f8ea8 80.59%, #425dc6 87.87%, #693fe0 92.92%, #891cde 97.58%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
