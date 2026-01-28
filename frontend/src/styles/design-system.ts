/**
 * Straxis CORE Design System
 * Design tokens e variáveis do sistema
 */

export const designTokens = {
  // Colors - Light Mode
  light: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.06)',
    borderStrong: 'rgba(0, 0, 0, 0.12)',
    textPrimary: '#1D1D1F',
    textSecondary: '#86868B',
    textTertiary: '#C7C7CC',
    accent: '#007AFF',
    accentHover: '#0051D5',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Colors - Dark Mode
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    textPrimary: '#F5F5F7',
    textSecondary: '#98989D',
    textTertiary: '#48484A',
    accent: '#0A84FF',
    accentHover: '#409CFF',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // Border Radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    md: '0 2px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
  },

  // Typography
  typography: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', system-ui, sans-serif`,
    fontMono: `'SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', monospace`,
    
    display: {
      size: '32px',
      weight: '600',
      lineHeight: '1.2',
      letterSpacing: '-0.5px',
    },
    title1: {
      size: '28px',
      weight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.4px',
    },
    title2: {
      size: '22px',
      weight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.3px',
    },
    title3: {
      size: '20px',
      weight: '600',
      lineHeight: '1.35',
      letterSpacing: '-0.2px',
    },
    headline: {
      size: '17px',
      weight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.4px',
    },
    body: {
      size: '17px',
      weight: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.4px',
    },
    callout: {
      size: '16px',
      weight: '400',
      lineHeight: '1.45',
      letterSpacing: '-0.3px',
    },
    subhead: {
      size: '15px',
      weight: '400',
      lineHeight: '1.4',
      letterSpacing: '-0.2px',
    },
    footnote: {
      size: '13px',
      weight: '400',
      lineHeight: '1.35',
      letterSpacing: '-0.1px',
    },
    caption: {
      size: '12px',
      weight: '400',
      lineHeight: '1.3',
      letterSpacing: '0px',
    },
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Z-Index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    toast: 1400,
    dock: 1500,
  },

  // Blur
  blur: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
} as const;

export type DesignTokens = typeof designTokens;
