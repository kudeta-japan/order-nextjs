import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#16a34a',
        bg: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        muted: '#64748b',
        border: '#e2e8f0',
      },
      boxShadow: {
        default: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
