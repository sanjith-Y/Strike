/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#07090e',
          surface: '#0f141f',
          card: '#141c2c',
          border: '#1e293b',
          accent: '#00d2ff',
          neon: '#00f0ff',
          laser: '#ff0055',
          gold: '#f59e0b',
          success: '#10b981'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-strong': '0 0 25px rgba(0, 240, 255, 0.7)',
        'laser': '0 0 15px rgba(255, 0, 85, 0.4)',
      }
    },
  },
  plugins: [],
}
