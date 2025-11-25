import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Web3 Palette
        web3: {
          bg: '#030305',
          card: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          primary: '#3B82F6', // Blue
          secondary: '#8B5CF6', // Violet
          accent: '#22D3EE', // Cyan
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        // Map legacy terminal colors to new palette for compatibility
        terminal: {
          bg: '#030305',
          fg: '#F8FAFC', 
          cyan: '#22D3EE',   // Mapped to Accent
          green: '#10B981',  // Mapped to Success
          yellow: '#F59E0B', // Mapped to Warning
          red: '#EF4444',    // Mapped to Error
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'], // Better mono font
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
