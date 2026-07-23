import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScaffold, AppText, OptionWheel } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { MONTHS_TR, TOTAL_ONBOARDING_STEPS, daysInMonth } from '../../src/data/onboardingOptions';

const CURRENT_YEAR = 2026;
const MIN_YEAR = 1920;
const YEARS = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => String(CURRENT_YEAR - i));

export default function Step3() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);

    // Parse existing birthDate or default to 1 Jan 1998.
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

    const yearIndex = YEARS.indexOf(String(year));

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
            subtitle="Güneş burcunu ve doğum haritanı çıkarmak için tarihini öğrenelim."
            onNext={handleNext}
        >
            <View style={styles.block}>
                <AppText variant="label" style={styles.label}>Gün</AppText>
                <OptionWheel
                    value={safeDay - 1}
                    options={dayOptions}
                    onChange={(i) => setDay(i + 1)}
                />
            </View>
            <View style={styles.block}>
                <AppText variant="label" style={styles.label}>Ay</AppText>
                <OptionWheel
                    value={month - 1}
                    options={MONTHS_TR}
                    onChange={(i) => setMonth(i + 1)}
                />
            </View>
            <View style={styles.block}>
                <AppText variant="label" style={styles.label}>Yıl</AppText>
                <OptionWheel
                    value={yearIndex < 0 ? 0 : yearIndex}
                    options={YEARS}
                    wrap={false}
                    onChange={(i) => setYear(Number(YEARS[i]))}
                />
            </View>
            <AppText variant="caption" color={Colors.textMuted} style={styles.preview}>
                {safeDay} {MONTHS_TR[month - 1]} {year}
            </AppText>
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    block: { marginBottom: Spacing.lg },
    label: { marginBottom: Spacing.sm, marginLeft: Spacing.xs },
    preview: { textAlign: 'center', marginTop: Spacing.sm },
});
