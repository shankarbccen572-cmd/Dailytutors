/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mdx}',
    './components/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        brand: {
          primary: '#FFFFFF',
          surface: '#FBF8F7',
          accent: '#FF3131',
          accentDark: '#D81F1F',
          accentLight: '#FFEAEA',
          secondary: '#1A1A1A',
          secondaryDark: '#000000',
          textPrimary: '#1A1A1A',
          textSecondary: '#6B6B6B',
          border: '#EAEAEA',
          success: '#1F9D55',
          warning: '#F5A623',
        },
      },
      fontFamily: {
        // Inter for body / UI text
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Poppins (600/700) for headings
        heading: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16,24,40,0.04), 0 1px 3px 0 rgba(16,24,40,0.06)',
        cardHover:
          '0 20px 40px -16px rgba(16,24,40,0.16), 0 8px 16px -8px rgba(16,24,40,0.08)',
        accent: '0 8px 20px -6px rgba(255,49,49,0.45)',
        accentLg: '0 18px 40px -12px rgba(255,49,49,0.5)',
        glow: '0 0 0 1px rgba(255,49,49,0.08), 0 12px 32px -12px rgba(255,49,49,0.28)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #FF3131 0%, #D81F1F 100%)',
        'accent-gradient-soft': 'linear-gradient(135deg, #FF5A5A 0%, #D81F1F 100%)',
        'hero-glow':
          'radial-gradient(60% 60% at 50% 0%, #FFEAEA 0%, rgba(255,234,234,0) 70%)',
        'hero-mesh':
          'radial-gradient(45% 55% at 15% 20%, rgba(255,90,90,0.16) 0%, rgba(255,90,90,0) 60%), radial-gradient(40% 50% at 85% 10%, rgba(255,49,49,0.12) 0%, rgba(255,49,49,0) 55%), radial-gradient(50% 60% at 60% 100%, rgba(216,31,31,0.08) 0%, rgba(216,31,31,0) 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
