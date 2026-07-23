import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

export default function Step4() {
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const setProfile = useUserStore((s) => s.setProfile);

    const handleNext = () => {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        setProfile({ birthTime: timeStr });
        router.push('/(auth)/step5');
    };

    return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.step}>4 / 8</Text>
                    <Text style={styles.title}>Doğum Saatiniz</Text>
                    <Text style={styles.subtitle}>
                        Yükselen burcunuzu hesaplayabilmemiz için doğum saatinizi bilmemiz gerekiyor.
                    </Text>

                    <View style={styles.timeRow}>
                        {/* Hour */}
                        <View style={styles.timeCol}>
                            <TouchableOpacity
                                style={styles.arrowBtn}
                                onPress={() => setHour((h) => (h + 1) % 24)}
                            >
                                <Text style={styles.arrow}>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{String(hour).padStart(2, '0')}</Text>
                            <TouchableOpacity
                                style={styles.arrowBtn}
                                onPress={() => setHour((h) => (h - 1 + 24) % 24)}
                            >
                                <Text style={styles.arrow}>-</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.colon}>:</Text>

                        {/* Minute */}
                        <View style={styles.timeCol}>
                            <TouchableOpacity
                                style={styles.arrowBtn}
                                onPress={() => setMinute((m) => (m + 5) % 60)}
                            >
                                <Text style={styles.arrow}>+</Text>
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{String(minute).padStart(2, '0')}</Text>
                            <TouchableOpacity
                                style={styles.arrowBtn}
                                onPress={() => setMinute((m) => (m - 5 + 60) % 60)}
                            >
                                <Text style={styles.arrow}>-</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Text style={styles.backText}>← Geri</Text>
                        </TouchableOpacity>
                        <PrimaryButton title="Devam Et" onPress={handleNext} style={{ flex: 1 }} />
                    </View>
                </View>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        paddingTop: 100,
    },
    step: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxxl,
        lineHeight: 22,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    timeCol: {
        alignItems: 'center',
        gap: Spacing.md,
    },
    arrowBtn: {
        width: 56,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.backgroundCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    arrow: {
        fontSize: FontSize.xl,
        color: Colors.purpleLight,
        fontWeight: '600',
    },
    timeValue: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    colon: {
        fontSize: 48,
        fontWeight: '700',
        color: Colors.textMuted,
        marginBottom: 5,
    },
    footer: {
        paddingBottom: Spacing.huge,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    backText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
});
