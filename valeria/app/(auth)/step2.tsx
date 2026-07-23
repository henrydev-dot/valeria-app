import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScaffold, AppText } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { GENDER_OPTIONS, TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

export default function Step2() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);
    const [selected, setSelected] = useState(profile.gender || '');

    const handleNext = () => {
        if (!selected) return;
        setProfile({ gender: selected });
        router.push('/(auth)/step3');
    };

    return (
        <OnboardingScaffold
            step={2}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Cinsiyetin"
            subtitle="Kendine en yakın hissettiğin seçeneği seç. Bu bilgi yorumlarını kişiselleştirmemize yardımcı olur."
            onNext={handleNext}
            nextDisabled={!selected}
        >
            <View style={styles.grid}>
                {GENDER_OPTIONS.map((option) => {
                    const isSelected = selected === option.id;
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => setSelected(option.id)}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                        >
                            <Ionicons
                                name={option.icon}
                                size={26}
                                color={isSelected ? Colors.accentYellow : Colors.textMuted}
                            />
                            <AppText
                                variant="callout"
                                center
                                color={isSelected ? Colors.textPrimary : Colors.textSecondary}
                            >
                                {option.label}
                            </AppText>
                            {isSelected ? (
                                <View style={styles.check}>
                                    <Ionicons name="checkmark-circle" size={18} color={Colors.accentYellow} />
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    card: {
        width: '47%',
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surface1,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
    },
    cardSelected: { backgroundColor: Colors.purpleA15, borderColor: Colors.borderAccent },
    check: { position: 'absolute', top: 8, right: 8 },
});
