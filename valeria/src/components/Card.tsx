import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing, Shadows } from '../theme/spacing';

interface CardProps {
    children: React.ReactNode;
    glow?: boolean;
    onPress?: () => void;
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

/**
 * Base surface primitive. Use for every grouped block so radius/border/shadow
 * stay consistent across the app.
 */
export function Card({ children, glow, onPress, padded = true, style, accessibilityLabel }: CardProps) {
    const content = (
        <View
            style={[
                styles.card,
                padded && styles.padded,
                glow && styles.glow,
                glow ? Shadows.glowPurple : Shadows.md,
                style,
            ]}
        >
            {children}
        </View>
    );
    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                {content}
            </TouchableOpacity>
        );
    }
    return content;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    padded: { padding: Spacing.xl },
    glow: { borderColor: Colors.purpleGlow },
});
