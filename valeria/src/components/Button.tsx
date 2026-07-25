import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ViewStyle,
    StyleProp,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme/colors';
import { BorderRadius, Spacing, Shadows } from '../theme/spacing';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

const PADS: Record<Size, ViewStyle> = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    md: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
};

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'lg',
    disabled = false,
    loading = false,
    icon,
    fullWidth = true,
    style,
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const inner = (
        <>
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? Colors.textOnAccent : Colors.textPrimary} />
            ) : (
                <View style={styles.row}>
                    {icon}
                    <AppText
                        variant="button"
                        color={
                            variant === 'primary'
                                ? Colors.textOnAccent
                                : variant === 'danger'
                                ? Colors.error
                                : Colors.textPrimary
                        }
                    >
                        {title}
                    </AppText>
                </View>
            )}
        </>
    );

    const common: StyleProp<ViewStyle> = [
        styles.base,
        PADS[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
    ];

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={title}
                accessibilityState={{ disabled: isDisabled, busy: loading }}
                style={[styles.wrap, fullWidth && styles.fullWidth, !isDisabled && Shadows.glowGold, style]}
            >
                <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, PADS[size], isDisabled && styles.disabled]}>
                    {inner}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={[
                common,
                variant === 'secondary' && styles.secondary,
                variant === 'ghost' && styles.ghost,
                variant === 'danger' && styles.dangerBtn,
            ]}
        >
            {inner}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    base: {
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    fullWidth: { alignSelf: 'stretch' },
    secondary: {
        borderWidth: 1.5,
        borderColor: Colors.purpleLight,
        backgroundColor: Colors.purpleA15,
    },
    ghost: { backgroundColor: Colors.whiteA05, borderWidth: 1, borderColor: Colors.border },
    dangerBtn: { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: 'rgba(248,113,113,0.08)' },
    disabled: { opacity: 0.45 },
});
