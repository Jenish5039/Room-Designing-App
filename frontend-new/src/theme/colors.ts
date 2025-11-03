// Purple and White Theme Configuration
export const theme = {
  colors: {
    // Primary Purple Shades
    primary: '#7B68EE', // Medium purple
    primaryLight: '#9B8EFF', // Lighter purple
    primaryDark: '#5A4FCF', // Darker purple
    primaryLighter: '#E8E4FF', // Very light purple for backgrounds
    
    // Secondary Colors
    secondary: '#9370DB', // Medium purple
    accent: '#BA55D3', // Purple accent
    
    // White and Grays
    white: '#FFFFFF',
    background: '#F8F9FA', // Off-white background
    surface: '#FFFFFF',
    
    // Text Colors
    textPrimary: '#2C2C2C', // Dark gray for primary text
    textSecondary: '#666666', // Medium gray for secondary text
    textLight: '#999999', // Light gray for hints
    
    // Status Colors
    success: '#4CAF50',
    successLight: '#E8F5E9',
    error: '#F44336',
    errorLight: '#FFEBEE',
    warning: '#FF9800',
    warningLight: '#FFF3E0',
    info: '#2196F3',
    infoLight: '#E3F2FD',
    
    // Borders and Dividers
    border: '#E0E0E0',
    divider: '#EEEEEE',
    
    // Shadows
    shadow: 'rgba(123, 104, 238, 0.15)', // Purple tinted shadow
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: '#2C2C2C',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#2C2C2C',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#2C2C2C',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: '#666666',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#999999',
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: '#999999',
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#7B68EE',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#7B68EE',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#7B68EE',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Import fonts
import fonts from './fonts';

// Extend theme with fonts
export const themeWithFonts = {
  ...theme,
  fonts,
};

export default theme;

