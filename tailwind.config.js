/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d1f',
          900: '#0b132b',
          850: '#0e1a38',
          800: '#142145',
          700: '#1e295d',
          600: '#253575',
        },
        elite: {
          green: '#10b981',
          greenLight: '#34d399',
          greenNeon: '#00e676',
          greenDark: '#047857',
          blue: '#00f0ff',
          blueElectric: '#2563eb',
          blueDark: '#1d4ed8',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        tech: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', '"Rajdhani"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2)',
        'neon-blue': '0 0 15px rgba(0, 240, 255, 0.4), 0 0 30px rgba(0, 240, 255, 0.2)',
        'elite-glow': '0 0 25px rgba(16, 185, 129, 0.35), 0 0 50px rgba(0, 240, 255, 0.2)',
        'glass-clean': '0 10px 30px -5px rgba(11, 19, 43, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        'glass-navy': '0 12px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
