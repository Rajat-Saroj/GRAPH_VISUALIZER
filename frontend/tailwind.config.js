module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0eafc',
          100: '#cfdef3',
          300: '#93c5fd', // Used in focus rings
          500: '#2563eb',
          600: '#2563eb', // Main primary color
          700: '#1e40af'
        }
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'sans-serif']
      },
      boxShadow: {
        'graph': '0 8px 32px rgba(80,120,180,0.10)',
        'modal': '0 20px 40px rgba(0,0,0,0.3)' // Used in modals
      }
    },
  },
  plugins: [],
}


