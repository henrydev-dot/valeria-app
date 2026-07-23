import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, FontSize, Spacing } from '../theme/spacing';

interface PillBadgeProps {
    label: string;
    value: string | number;
    icon?: keyof typeof Ionicons.glyphMap;
    color?: string;
    style?: ViewStyle;
}

export function PillBadge({
    label,
    value,
    icon,
    color = Colors.accentYellow,
    style,
}: PillBadgeProps) {
    return (
        <View style={[styles.pill, { borderColor: color + '40' }, style]}>
            {icon && <Ionicons name={icon} size={14} color={color} />}
            <Text style={[styles.value, { color }]}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.backgroundCardLight,
        borderWidth: 1,
        gap: 4,
    },
    value: {
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
    label: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
});
