import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          text: '#e6edf3',
          muted: '#8b949e',
          accent: '#58a6ff',
          highlight: '#1f6feb'
        }
      },
      animation: {
        'rain-drop': 'rainDrop 1s linear infinite',
        'cloud-drift': 'cloudDrift 20s linear infinite',
        'snow-fall': 'snowFall 8s linear infinite',
        'sun-glow': 'sunGlow 3s ease-in-out infinite'
      },
      keyframes: {
        rainDrop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' }
        },
        cloudDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' }
        },
        snowFall: {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' }
        },
        sunGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' }
        }
      }
    }
  },
  plugins: []
} satisfies Config
