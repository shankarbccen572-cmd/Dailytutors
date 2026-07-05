/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,mdx}',
    './components/**/*.{js,jsx,mdx}',
  ],
  theme: {
    extend: {
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
          '0 12px 24px -8px rgba(16,24,40,0.12), 0 4px 8px -4px rgba(16,24,40,0.06)',
        accent: '0 8px 20px -6px rgba(255,49,49,0.45)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #FF3131 0%, #D81F1F 100%)',
        'hero-glow':
          'radial-gradient(60% 60% at 50% 0%, #FFEAEA 0%, rgba(255,234,234,0) 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
