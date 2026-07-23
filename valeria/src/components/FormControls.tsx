import React from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { AppText } from './AppText';

/* ---------------- Field (labelled input with error) ---------------- */
interface FieldProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

export function Field({ label, error, icon, containerStyle, style, ...rest }: FieldProps) {
    return (
        <View style={[styles.fieldWrap, containerStyle]}>
            {label ? <AppText variant="label" style={styles.fieldLabel}>{label}</AppText> : null}
            <View style={[styles.inputRow, error ? styles.inputError : null]}>
                {icon ? <View style={styles.inputIcon}>{icon}</View> : null}
                <TextInput
                    placeholderTextColor={Colors.textMuted}
                    style={[styles.input, style]}
                    {...rest}
                />
            </View>
            {error ? <AppText variant="caption" color={Colors.error} style={styles.errorText}>{error}</AppText> : null}
        </View>
    );
}

/* ---------------- Chip ---------------- */
interface ChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected, onPress, icon, style }: ChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: !!selected }}
            style={[styles.chip, selected && styles.chipSelected, style]}
        >
            {icon}
            <AppText
                variant="callout"
                color={selected ? Colors.textOnAccent : Colors.textSecondary}
                style={selected ? styles.chipTextSelected : undefined}
            >
                {label}
            </AppText>
        </TouchableOpacity>
    );
}

/* ---------------- SegmentedControl ---------------- */
interface SegmentedProps {
    segments: string[];
    value: number;
    onChange: (index: number) => void;
    style?: StyleProp<ViewStyle>;
}

export function SegmentedControl({ segments, value, onChange, style }: SegmentedProps) {
    return (
        <View style={[styles.segment, style]}>
            {segments.map((s, i) => (
                <TouchableOpacity
                    key={s}
                    onPress={() => onChange(i)}
                    activeOpacity={0.85}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: i === value }}
                    style={[styles.segmentItem, i === value && styles.segmentItemActive]}
                >
                    <AppText
                        variant="bodyStrong"
                        color={i === value ? Colors.textOnAccent : Colors.textSecondary}
                    >
                        {s}
                    </AppText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

/* ---------------- Stepper (labelled +/- selector) ---------------- */
interface OptionWheelProps {
    /** Currently selected index into `options`. */
    value: number;
    options: string[];
    onChange: (index: number) => void;
    wrap?: boolean;
}

export function OptionWheel({ value, options, onChange, wrap = true }: OptionWheelProps) {
    const dec = () => onChange(value <= 0 ? (wrap ? options.length - 1 : 0) : value - 1);
    const inc = () => onChange(value >= options.length - 1 ? (wrap ? 0 : options.length - 1) : value + 1);
    return (
        <View style={styles.wheel}>
            <TouchableOpacity onPress={dec} style={styles.wheelBtn} accessibilityRole="button" accessibilityLabel="Azalt">
                <AppText variant="h1" color={Colors.accentYellow}>−</AppText>
            </TouchableOpacity>
            <View style={styles.wheelValue}>
                <AppText variant="h1">{options[value]}</AppText>
            </View>
            <TouchableOpacity onPress={inc} style={styles.wheelBtn} accessibilityRole="button" accessibilityLabel="Arttır">
                <AppText variant="h1" color={Colors.accentYellow}>+</AppText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    fieldWrap: { marginBottom: Spacing.lg },
    fieldLabel: { marginBottom: Spacing.xs, marginLeft: Spacing.xs },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.lg,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, color: Colors.textPrimary, fontSize: 16, paddingVertical: Spacing.lg },
    inputError: { borderColor: Colors.error },
    errorText: { marginTop: Spacing.xs, marginLeft: Spacing.xs },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.pill,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.whiteA05,
    },
    chipSelected: { backgroundColor: Colors.accentYellow, borderColor: Colors.accentYellow },
    chipTextSelected: { fontWeight: '700' },
    segment: {
        flexDirection: 'row',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.md,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    segmentItem: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.sm },
    segmentItemActive: { backgroundColor: Colors.accentYellow },
    wheel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.sm,
    },
    wheelBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
    wheelValue: { flex: 1, alignItems: 'center' },
});
