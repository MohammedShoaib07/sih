// Design System - Natural, human-crafted aesthetic
export const designSystem = {
  // Color palette inspired by real-world materials
  colors: {
    // Primary - Road/Asphalt inspired
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9', 
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Main brand color
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    
    // Severity colors - traffic light inspired but softer
    severity: {
      high: {
        bg: '#fef2f2',
        border: '#fecaca', 
        text: '#dc2626',
        accent: '#ef4444'
      },
      medium: {
        bg: '#fffbeb',
        border: '#fed7aa',
        text: '#d97706', 
        accent: '#f59e0b'
      },
      low: {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        text: '#16a34a',
        accent: '#22c55e'
      }
    },
    
    // Status colors - natural progression
    status: {
      pending: {
        bg: '#fefce8',
        border: '#fde047',
        text: '#a16207',
        accent: '#eab308'
      },
      in_progress: {
        bg: '#eff6ff',
        border: '#93c5fd',
        text: '#1d4ed8',
        accent: '#3b82f6'
      },
      resolved: {
        bg: '#f0fdf4',
        border: '#86efac',
        text: '#15803d',
        accent: '#22c55e'
      },
      rejected: {
        bg: '#fef2f2',
        border: '#fca5a5',
        text: '#dc2626',
        accent: '#ef4444'
      }
    },

    // Verification colors - trust and validation
    verification: {
      pending: {
        bg: '#fefce8',
        border: '#fde047',
        text: '#a16207',
        accent: '#eab308'
      },
      verified: {
        bg: '#ecfdf5',
        border: '#86efac',
        text: '#059669',
        accent: '#10b981'
      },
      rejected: {
        bg: '#fef2f2',
        border: '#fca5a5',
        text: '#dc2626',
        accent: '#ef4444'
      }
    },
    
    // Neutral grays - warm undertones
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5', 
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    }
  },
  
  // Typography scale - readable and friendly
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }], 
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
    },
    fontWeight: {
      normal: '400',
      medium: '500', 
      semibold: '600',
      bold: '700'
    }
  },
  
  // Spacing - consistent rhythm
  spacing: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem', 
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },
  
  // Border radius - subtle curves
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem', 
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  // Shadows - realistic depth
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none'
  },
  
  // Animation - smooth and natural
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms', 
      slow: '350ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)', 
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// Component variants - consistent patterns
export const componentVariants = {
  button: {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm',
    ghost: 'hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
  },
  
  card: {
    default: 'bg-white border border-gray-200 shadow-sm rounded-xl',
    elevated: 'bg-white border border-gray-200 shadow-lg rounded-xl',
    interactive: 'bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow'
  },
  
  badge: {
    default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    dot: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium'
  }
};

// Utility functions
export const getStatusColor = (status: string) => {
  return designSystem.colors.status[status as keyof typeof designSystem.colors.status] || designSystem.colors.status.pending;
};

export const getSeverityColor = (severity: string) => {
  return designSystem.colors.severity[severity as keyof typeof designSystem.colors.severity] || designSystem.colors.severity.medium;
};

export const getVerificationColor = (verification: string) => {
  return designSystem.colors.verification[verification as keyof typeof designSystem.colors.verification] || designSystem.colors.verification.pending;
};
