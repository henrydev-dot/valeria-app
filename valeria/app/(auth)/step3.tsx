import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScaffold, AppText, WheelPicker } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { MONTHS_TR, TOTAL_ONBOARDING_STEPS, daysInMonth } from '../../src/data/onboardingOptions';

const CURRENT_YEAR = 2026;
const MIN_YEAR = 1920;
// Years newest-first so recent years need the least scrolling.
const YEARS = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => String(CURRENT_YEAR - i));

export default function Step3() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);

    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)
        ? profile.birthDate.split('-').map(Number)
        : [1998, 1, 1];
    const [year, setYear] = useState(parsed[0]);
    const [month, setMonth] = useState(parsed[1]); // 1-based
    const [day, setDay] = useState(parsed[2]);

    const maxDay = daysInMonth(month, year);
    const safeDay = Math.min(day, maxDay);
    const dayOptions = useMemo(
        () => Array.from({ length: maxDay }, (_, i) => String(i + 1)),
        [maxDay]
    );
    const yearIndex = Math.max(0, YEARS.indexOf(String(year)));

    const handleNext = () => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
        setProfile({ birthDate: dateStr });
        router.push('/(auth)/step4');
    };

    return (
        <OnboardingScaffold
            step={3}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Doğum tarihin"
            subtitle="Güneş burcunu ve doğum haritanı çıkarmak için tarihini seç."
            onNext={handleNext}
            scroll={false}
        >
            <View style={styles.labels}>
                <AppText variant="label" center style={styles.label}>Gün</AppText>
                <AppText variant="label" center style={styles.labelWide}>Ay</AppText>
                <AppText variant="label" center style={styles.label}>Yıl</AppText>
            </View>
            <View style={styles.pickerRow}>
                <WheelPicker options={dayOptions} value={safeDay - 1} onChange={(i) => setDay(i + 1)} />
                <WheelPicker options={MONTHS_TR} value={month - 1} onChange={(i) => setMonth(i + 1)} width={130} />
                <WheelPicker options={YEARS} value={yearIndex} onChange={(i) => setYear(Number(YEARS[i]))} />
            </View>
            <View style={styles.previewWrap}>
                <AppText variant="bodyStrong" center>
                    {safeDay} {MONTHS_TR[month - 1]} {year}
                </AppText>
            </View>
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    labels: { flexDirection: 'row', marginTop: Spacing.xl, marginBottom: Spacing.sm },
    label: { flex: 1 },
    labelWide: { width: 130 },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.sm,
    },
    previewWrap: {
        marginTop: Spacing.xl,
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.goldA12,
    },
});
