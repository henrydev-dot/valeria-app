export const Colors = {
    // Backgrounds
    backgroundDark: '#0A0A1A',
    backgroundCard: '#0F1020',
    backgroundCardLight: '#161830',
    backgroundModal: '#1A1A2E',

    // Elevated surfaces (design-system tokens)
    surface1: '#12132A',
    surface2: '#181A34',
    surface3: '#20223F',

    // Gradients
    gradientStart: '#2D1B69',
    gradientMiddle: '#1A1145',
    gradientEnd: '#0A0A1A',

    // Accent - Yellow/Gold
    accentYellow: '#F5C842',
    accentYellowLight: '#FFD966',
    accentYellowDark: '#D4A520',
    accentGradientStart: '#F5C842',
    accentGradientEnd: '#D4A520',

    // Purple accents
    purple: '#7C3AED',
    purpleLight: '#A78BFA',
    purpleDark: '#5B21B6',
    purpleGlow: 'rgba(124, 58, 237, 0.3)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B8B8D0',
    textMuted: '#6B6B8D',
    textAccent: '#F5C842',
    textOnAccent: '#0A0A1A',

    // Functional
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',

    // Borders & Shadows
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    borderAccent: 'rgba(245, 200, 66, 0.35)',
    glow: 'rgba(124, 58, 237, 0.25)',
    shadow: 'rgba(0, 0, 0, 0.5)',

    // Tags
    tagFree: '#34D399',
    tagPro: '#F5C842',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    scrim: 'rgba(10, 10, 26, 0.72)',

    // Transparent helpers
    whiteA05: 'rgba(255, 255, 255, 0.05)',
    whiteA08: 'rgba(255, 255, 255, 0.08)',
    whiteA12: 'rgba(255, 255, 255, 0.12)',
    purpleA15: 'rgba(124, 58, 237, 0.15)',
    purpleA25: 'rgba(124, 58, 237, 0.25)',
    goldA12: 'rgba(245, 200, 66, 0.12)',
    goldA20: 'rgba(245, 200, 66, 0.20)',
} as const;

// Ready-made gradient tuples for expo-linear-gradient
export const Gradients = {
    background: [Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd] as const,
    gold: [Colors.accentYellowLight, Colors.accentYellowDark] as const,
    purple: [Colors.purple, Colors.purpleDark] as const,
    card: [Colors.surface2, Colors.surface1] as const,
    aurora: ['#2D1B69', '#3B2A7A', '#1A1145'] as const,
};
