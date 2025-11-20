/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'black-charcoal': '#121212',
        'white-smoke':   '#F5F5F5',
        'red-blood':     '#C62828',
        'gray-matte':    '#1E1E1E',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans)', 'sans-serif'],
        display: ['Oswald','Anton','Bebas Neue','sans-serif'],
        body:    ['Inter','Open Sans','sans-serif'],
      },
      letterSpacing: { widest: '0.1em' },
    },
  },
};
