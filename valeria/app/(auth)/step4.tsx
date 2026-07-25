import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScaffold, AppText, WheelPicker } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function Step4() {
    const setProfile = useUserStore((s) => s.setProfile);
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [unknown, setUnknown] = useState(false);

    const handleNext = () => {
        // If unknown, default to solar noon; rising sign will be approximate.
        const timeStr = unknown ? '12:00' : `${HOURS[hour]}:${MINUTES[minute]}`;
        setProfile({ birthTime: timeStr });
        router.push('/(auth)/step5');
    };

    return (
        <OnboardingScaffold
            step={4}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Doğum saatin"
            subtitle="Yükselen burcun için doğum saatin gerekir. Bilmiyorsan sorun değil — yaklaşık hesaplarız."
            onNext={handleNext}
        >
            {!unknown ? (
                <View>
                    <View style={styles.timeLabels}>
                        <AppText variant="label" center style={styles.col}>Saat</AppText>
                        <AppText variant="label" center style={styles.col}>Dakika</AppText>
                    </View>
                    <View style={styles.timeRow}>
                        <WheelPicker options={HOURS} value={hour} onChange={setHour} />
                        <View style={styles.colon}><AppText variant="h1" color={Colors.textMuted}>:</AppText></View>
                        <WheelPicker options={MINUTES} value={minute} onChange={setMinute} />
                    </View>
                </View>
            ) : (
                <View style={styles.unknownBox}>
                    <Ionicons name="time-outline" size={32} color={Colors.textMuted} />
                    <AppText variant="body" center color={Colors.textSecondary} style={styles.unknownText}>
                        Doğum saatin bilinmiyor olarak işaretlendi. Güneş ve Ay burcun yine de doğru hesaplanır.
                    </AppText>
                </View>
            )}

            <TouchableOpacity
                style={[styles.toggle, unknown && styles.toggleActive]}
                onPress={() => setUnknown((u) => !u)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: unknown }}
            >
                <Ionicons
                    name={unknown ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={unknown ? Colors.accentYellow : Colors.textMuted}
                />
                <AppText variant="callout" color={unknown ? Colors.textPrimary : Colors.textSecondary}>
                    Doğum saatimi bilmiyorum
                </AppText>
            </TouchableOpacity>
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    timeLabels: { flexDirection: 'row', marginTop: Spacing.xl, marginBottom: Spacing.sm },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.sm,
    },
    colon: { width: 20, alignItems: 'center' },
    col: { flex: 1 },
    label: { marginBottom: Spacing.sm },
    unknownBox: {
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surface1,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    unknownText: { paddingHorizontal: Spacing.md },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.whiteA05,
    },
    toggleActive: { borderColor: Colors.borderAccent, backgroundColor: Colors.goldA12 },
});
