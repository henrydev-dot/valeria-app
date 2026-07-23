import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, FontSize, Spacing } from '../theme/spacing';

interface StatBarProps {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
    style?: ViewStyle;
}

export function StatBar({
    label,
    value,
    maxValue,
    color = Colors.accentYellow,
    style,
}: StatBarProps) {
    const percentage = Math.min((value / maxValue) * 100, 100);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.value, { color }]}>
                    {value}/{maxValue}
                </Text>
            </View>
            <View style={styles.barBackground}>
                <View
                    style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    value: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    barBackground: {
        height: 6,
        backgroundColor: Colors.backgroundCardLight,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: BorderRadius.full,
    },
});
