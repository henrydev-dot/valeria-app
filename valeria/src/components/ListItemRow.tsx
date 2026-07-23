import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, FontSize, Spacing } from '../theme/spacing';

interface ListItemRowProps {
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    rightText?: string;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    style?: ViewStyle;
}

export function ListItemRow({
    icon,
    iconColor = Colors.purpleLight,
    title,
    subtitle,
    rightText,
    rightIcon = 'chevron-forward',
    onPress,
    style,
}: ListItemRowProps) {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            {icon && (
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            {rightText && <Text style={styles.rightText}>{rightText}</Text>}
            {onPress && (
                <Ionicons name={rightIcon} size={18} color={Colors.textMuted} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.backgroundCardLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: 2,
    },
    rightText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginRight: Spacing.sm,
    },
});
