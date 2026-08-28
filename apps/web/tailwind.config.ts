import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ═══ ETaxwala Official Brand Colors & Multicolour Logo Theme ═══
        brand: {
          navy:    '#003A66',  // Primary — deep professional navy
          gold:    '#d49d0e',  // Secondary — golden amber CTA
          'navy-dark': '#002a4a',
          'navy-light': '#004d87',
          'gold-light': '#f0b82a',
          'gold-dark': '#a87a09',
          'bg-light': '#F0F5FB', // Light page background

          // Multicolour Logo Spectrum
          cyan:    '#0084D1',  // Cyan/Ocean Blue
          blue:    '#003A66',  // Deep Blue
          purple:  '#7C3AED',  // Violet/Purple
          magenta: '#E11D48',  // Pink/Crimson
          orange:  '#F97316',  // Sunset Coral
        },
        // Legacy aliases to keep existing components working
        primary: {
          DEFAULT: '#003A66',
          50:  '#E6F0FA',
          100: '#CCE1F5',
          200: '#99C3EB',
          300: '#66A4E0',
          400: '#3386D6',
          500: '#003A66',
          600: '#002a4a',
          700: '#001f36',
          800: '#001422',
          900: '#000a0f',
        },
        accent: {
          DEFAULT: '#d49d0e',
          50:  '#FEF9E7',
          100: '#FDF3C9',
          200: '#FBE893',
          300: '#F9DC5D',
          400: '#f0b82a',
          500: '#d49d0e',
          600: '#a87a09',
          700: '#7c5b07',
          800: '#503b04',
          900: '#241b02',
        },
        status: {
          notStarted:     '#94A3B8',
          wip:            '#3B82F6',
          pendingClient:  '#F59E0B',
          invoiced:       '#8B5CF6',
          paymentPending: '#F97316',
          completed:      '#10B981',
          returnBack:     '#EF4444',
          cancelled:      '#991B1B',
          feesPending:    '#F97316',
          onHold:         '#64748B',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'Plus Jakarta Sans', 'sans-serif'],
        outfit:  ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        opensans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '16px',
        lg:  '12px',
        md:  '8px',
        sm:  '6px',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        'card':     '0 2px 12px 0 rgba(0,58,102,0.08)',
        'card-hover': '0 8px 30px 0 rgba(0,58,102,0.15)',
        'nav':      '0 2px 20px 0 rgba(0,58,102,0.12)',
        'gold':     '0 4px 20px 0 rgba(212,157,14,0.35)',
        'hero':     '0 20px 60px 0 rgba(0,58,102,0.3)',
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #003A66 0%, #004d87 50%, #003A66 100%)',
        'hero-overlay':    'linear-gradient(rgba(0,58,102,0.88), rgba(0,42,74,0.92))',
        'gold-gradient':   'linear-gradient(135deg, #d49d0e 0%, #f0b82a 100%)',
        'navy-gradient':   'linear-gradient(135deg, #003A66 0%, #004d87 100%)',
        'light-gradient':  'linear-gradient(135deg, #F0F5FB 0%, #ffffff 100%)',
        'card-shine':      'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'slide-right':  'slideRight 0.4s ease-out',
        'pulse-gold':   'pulseGold 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'counter':      'counter 2s ease-out forwards',
        'shimmer':      'shimmer 2s infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,157,14,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(212,157,14,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;