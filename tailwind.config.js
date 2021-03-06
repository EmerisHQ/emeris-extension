module.exports = {
  purge: false,
  content: [
    './public/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './demeris/public/index.html',
    './demeris/src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      borderRadius: {
        xl: '0.625rem',
      },
      lineHeight: {
        title: 1.25,
        copy: 1.625,
      },
      fontSize: {
        '-2': [
          '.6875rem',
          {
            letterSpacing: '0.01em',
            lineHeight: '1.2727',
          },
        ],
        '-1': [
          '.8125rem',
          {
            letterSpacing: '0.01em',
            lineHeight: '1.3077',
          },
        ],
        0: [
          '1rem',
          {
            letterSpacing: '-0.007em',
            lineHeight: '1.5',
          },
        ],
        1: [
          '1.3125rem',
          {
            letterSpacing: '-0.015em',
            lineHeight: '1.2857',
          },
        ],
        2: [
          '1.75rem',
          {
            letterSpacing: '-0.02em',
            lineHeight: '1.2857',
          },
        ],
        3: [
          '2.375rem',
          {
            letterSpacing: '-0.027em',
            lineHeight: '1.2631',
          },
        ],
        4: [
          '3.1875rem',
          {
            letterSpacing: '-0.04em',
            lineHeight: '1.2549',
          },
        ],
        5: [
          '4.1875rem',
          {
            letterSpacing: '-0.055em',
            lineHeight: '1.194',
          },
        ],
      },
      animation: {
        'golden-ring-1': 'ring-spin-1 4s cubic-bezier(0.165, 0.84, 0.44, 1) infinite',
        'golden-ring-2': 'ring-spin-2 4s cubic-bezier(0.165, 0.84, 0.44, 1) infinite',
      },
      keyframes: {
        'ring-spin-1': {
          '0%': { transform: 'rotate(-37deg)' },
          '50%': { transform: 'rotate(143deg)' },
          '100%': { transform: 'rotate(323deg)' },
        },
        'ring-spin-2': {
          '0%': { transform: 'rotate(150deg)' },
          '50%': { transform: 'rotate(-30deg)' },
          '100%': { transform: 'rotate(-210deg)' },
        },
      },
    },
    backgroundImage: {
      grain: 'url(/images/texture-grain.png)',
      'list-card-gradient': 'linear-gradient(0deg, var(--surface-2) 0%, #1b1b1b 105%)',
    },
    boxShadow: {
      button: '3px 9px 32px -4px rgba(0, 0, 0, 0.07)',
      DEFAULT: '16px 32px 128px -8px rgba(0, 0, 0, 0.05)',
      card: '16px 32px 128px -8px rgba(0, 0, 0, 0.07)',
      panel: '24px 48px 104px -8px rgba(0, 0, 0, 0.09)',
      dropdown: '24px 64px 128px -8px rgba(0, 0, 0, 0.14)',
      'sheet-b': '0px -8px 48px -8px rgba(0, 0, 0, 0.07)',
      none: 'none',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      text: 'var(--text)',
      muted: 'var(--muted)',
      inactive: 'var(--inactive)',
      inverse: 'var(--inverse)',
      bg: 'var(--bg)',
      darkBanner: 'var(--darkBanner)',
      surface: {
        2: 'var(--surface-2)',
      },
      fg: {
        DEFAULT: 'var(--fg)',
        solid: 'var(--fg-solid)',
      },
      border: 'var(--border)',
      link: {
        DEFAULT: 'var(--link)',
        hover: 'var(--link-hover)',
      },
      positive: {
        DEFAULT: 'var(--positive)',
        text: 'var(--positive-text)',
      },
      negative: {
        DEFAULT: 'var(--negative)',
        text: 'var(--negative-text)',
      },
      warning: 'var(--warning)',
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      tertiary: 'var(--tertiary)',
      quaternary: 'var(--quaternary)',
      quinary: 'var(--quinary)',
      gold: 'var(--gold)',
    },
    fontFamily: {
      sans: 'Inter var, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
  },
  corePlugins: {
    gradientColorStops: false,
  },
  plugins: [],
};
