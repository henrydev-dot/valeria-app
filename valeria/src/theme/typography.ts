import { TextStyle } from 'react-native';
import { Colors } from './colors';

/**
 * Enforced type ramp. Every screen should use <AppText variant="..."> instead of
 * hardcoding fontSize/fontWeight. Line heights are tuned for Turkish diacritics.
 */
export const Typography: Record<string, TextStyle> = {
    hero: { fontSize: 34, lineHeight: 40, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },
    title: { fontSize: 27, lineHeight: 34, fontWeight: '700', color: Colors.textPrimary },
    h1: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: Colors.textPrimary },
    h2: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: Colors.textPrimary },
    h3: { fontSize: 16, lineHeight: 22, fontWeight: '600', color: Colors.textPrimary },
    body: { fontSize: 15, lineHeight: 23, fontWeight: '400', color: Colors.textSecondary },
    bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '600', color: Colors.textPrimary },
    callout: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: Colors.textSecondary },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: Colors.textMuted },
    label: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
    button: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
};

export type TypographyVariant = keyof typeof Typography;
