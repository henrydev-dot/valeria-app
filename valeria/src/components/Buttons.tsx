import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { BorderRadius, FontSize, Spacing } from '../theme/spacing';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
}

export function PrimaryButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    icon,
}: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={[Colors.accentYellow, Colors.accentYellowDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, disabled && styles.disabled]}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.backgroundDark} />
                ) : (
                    <>
                        {icon}
                        <Text style={styles.text}>{title}</Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

interface SecondaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
}

export function SecondaryButton({
    title,
    onPress,
    disabled = false,
    style,
    icon,
}: SecondaryButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.secondaryContainer, disabled && styles.disabled, style]}
        >
            {icon}
            <Text style={styles.secondaryText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        gap: Spacing.sm,
    },
    text: {
        color: Colors.backgroundDark,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.5,
    },
    secondaryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.purpleLight,
        gap: Spacing.sm,
    },
    secondaryText: {
        color: Colors.purpleLight,
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
});
