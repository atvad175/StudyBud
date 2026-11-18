import type { Config } from 'tailwindcss'

/**
 * StudyBud design tokens.
 *
 * Canvas is Obsidian Slate (`#09090B` / `#0B0D11`) with a cool blue-grey
 * undertone — deliberately never pure black, which causes halation and eye
 * strain on OLED panels during late-night sessions.
 *
 * The palette is semantic:
 *   indigo  → primary action, focus state, brand
 *   emerald → habit completion, streaks, earned wins
 *   amber   → leaderboard rank, competitive status
 *   coral   → urgency only (streak at risk, errors, unassigned warnings)
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        // Editorial light surface for the marketing pages. Warm paper, never
        // pure white, so a screen of copy reads like a printed page.
        paper: {
          DEFAULT: '#F6F1E7',
          50: '#FDFBF6',
          100: '#F6F1E7',
          200: '#EFE7D9',
          300: '#E3D7C3',
        },
        // Ink that belongs on paper: espresso → warm grey.
        espresso: {
          DEFAULT: '#1A1712',
          800: '#2B251D',
          700: '#3B342A',
          500: '#6B6152',
          400: '#8A7F6D',
        },
        // Brass is the paper-side accent: rules, italic emphasis, primary CTAs.
        brass: {
          200: '#EAD3A6',
          300: '#D9B478',
          400: '#C2913F',
          500: '#A87A25',
          600: '#8A6118',
        },
        surface: {
          DEFAULT: '#0B0D11',
          elevated: '#10131A',
          graphite: '#181B22',
        },
        // Cool slate ramp. 100 is Alabaster, 400 Cool Silver, 500 Muted Slate.
        ink: {
          950: '#09090B',
          900: '#0B0D11',
          850: '#10131A',
          800: '#181B22',
          700: '#232833',
          600: '#343B49',
          500: '#7C8593',
          400: '#9CA3AF',
          300: '#C3C8D2',
          200: '#E1E4EA',
          100: '#F4F4F6',
        },
        neon: {
          indigo: '#818CF8',
          'indigo-deep': '#6366F1',
          'indigo-soft': 'rgba(99, 102, 241, 0.14)',
          emerald: '#34D399',
          'emerald-deep': '#10B981',
          'emerald-soft': 'rgba(16, 185, 129, 0.14)',
          amber: '#F59E0B',
          'amber-soft': 'rgba(245, 158, 11, 0.12)',
          coral: '#FB7185',
          'coral-soft': 'rgba(251, 113, 133, 0.12)',
          // Legacy alias used by existing error states.
          rose: '#FB7185',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.08)',
      },
      boxShadow: {
        'glow-indigo': '0 0 44px -12px rgba(99, 102, 241, 0.6)',
        'glow-emerald': '0 0 44px -12px rgba(16, 185, 129, 0.55)',
        'glow-amber': '0 0 44px -12px rgba(245, 158, 11, 0.5)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        panel: '0 24px 60px -36px rgba(2, 6, 23, 0.95)',
        // The product window on the cream hero: a deep, soft drop shadow with
        // no hard edge, like a printed card lifted off the page.
        window: '0 60px 120px -48px rgba(20, 17, 12, 0.65), 0 12px 28px -18px rgba(20, 17, 12, 0.35)',
        paper: '0 26px 50px -34px rgba(26, 23, 18, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        serif: [
          'var(--font-serif)',
          '"Iowan Old Style"',
          'Palatino',
          'Georgia',
          'ui-serif',
          'serif',
        ],
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.35)' },
          '70%': { boxShadow: '0 0 0 14px rgba(16, 185, 129, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'float-y': 'float-y 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
