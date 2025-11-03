// Custom Font Configuration
// Note: To use custom fonts, you need to add font files to your project
// For now, we'll use system fonts with attractive styling

export const fonts = {
  // Primary heading font - bold and impactful
  heading: {
    fontFamily: 'System',
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  
  // Secondary heading
  subheading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  
  // Body text - readable and clean
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  
  // Bold body text
  bodyBold: {
    fontFamily: 'System',
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  
  // Button text
  button: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  
  // Caption text
  caption: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
};

// If you want to use custom fonts, add them to assets/fonts and configure here:
// For example:
// export const customFonts = {
//   heading: 'Montserrat-Bold',
//   body: 'Roboto-Regular',
//   button: 'Montserrat-SemiBold',
// };

export default fonts;



