/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateBg: '#FAF8F6',
        slateSurface: '#FFFFFF',
        slateBorder: '#ECE5DD',
        textPrimary: '#222222',
        textSecondary: '#615B54',
        childrenPrimary: '#D56332',
        childrenSecondary: '#E28D68',
        womenPrimary: '#A52A2A',
        womenSecondary: '#C05C5C',
        colorSuccess: '#10B981',
        colorWarning: '#F59E0B',
        colorError: '#EF4444'
      }
    },
  },
  plugins: [],
}
