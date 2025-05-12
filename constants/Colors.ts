export const Colors = {

  header: '#342998',
  // Primary colors
  primary: '#5B4CFF', // Deep purple/indigo
  primaryDark: '#4338CA', // Darker purple for gradients
  primaryLight: '#6366F1', // Lighter purple for gradients
  
  // Secondary colors
  secondary: '#EC4899', // Pink/magenta
  secondaryDark: '#DB2777', // Darker pink
  secondaryLight: '#F472B6', // Lighter pink

  // Accent colors
  accent: '#F59E0B', // Golden yellow
  accentDark: '#D97706', // Darker gold
  accentLight: '#FBBF24', // Lighter gold

  // Background gradients
  gradientStart: '#4338CA', // Top of gradient
  gradientMiddle: '#6366F1', // Middle of gradient
  gradientEnd: '#60A5FA', // Bottom of gradient

  // UI Elements
  surface: '#FFFFFF', // Card backgrounds
  surfaceHighlight: '#F3F4F6', // Subtle highlight
  border: '#E5E7EB', // Borders
  
  // Text colors
  text: '#1F2937', // Primary text
  textSecondary: '#4B5563', // Secondary text
  textLight: '#9CA3AF', // Lighter text
  textOnPrimary: '#FFFFFF', // Text on primary color

  // Status colors
  success: '#10B981', // Green
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue

  // Specific UI elements
  buttonPrimary: '#6366F1',
  buttonSecondary: '#EC4899',
  buttonDisabled: '#D1D5DB',
  inputBorder: '#E5E7EB',
  inputBorderFocus: '#6366F1',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
} as const;

// Gradient combinations
export const Gradients: { [key: string]: string[] } = {
  primary: ['#4338CA', '#6366F1', '#60A5FA'],
  secondary: ['#DB2777', '#EC4899', '#F472B6'],
  accent: ['#D97706', '#F59E0B', '#FBBF24'],
}; 