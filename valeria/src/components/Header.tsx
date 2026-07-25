import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { AppText } from './AppText';

interface HeaderProps {
    title?: string;
    onBack?: () => void;
    showBack?: boolean;
    right?: React.ReactNode;
}

/**
 * Lightweight stack-screen header. Sits inside a Screen's safe area, so it does
 * NOT add its own top inset.
 */
export function Header({ title, onBack, showBack = true, right }: HeaderProps) {
    const router = useRouter();
    const handleBack = onBack || (() => router.back());
    return (
        <View style={styles.row}>
            {showBack ? (
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Geri"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconBtn} />
            )}
            <AppText variant="h2" center style={styles.title} numberOfLines={1}>
                {title || ''}
            </AppText>
            <View style={styles.iconBtn}>{right}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1 },
});
