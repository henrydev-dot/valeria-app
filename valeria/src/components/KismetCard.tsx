import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';

interface KismetCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    glow?: boolean;
}

export function KismetCard({ children, style, glow = false }: KismetCardProps) {
    return (
        <View style={[styles.card, glow && styles.glow, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    glow: {
        borderColor: Colors.purpleGlow,
        shadowColor: Colors.purple,
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
});
