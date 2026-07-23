import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScaffold, AppText, Chip } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { RELATIONSHIP_OPTIONS, WORK_OPTIONS, TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

export default function Step6() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);
    const [relationship, setRelationship] = useState(profile.relationshipStatus || '');
    const [work, setWork] = useState(profile.workStatus || '');

    const handleNext = () => {
        if (!relationship || !work) return;
        setProfile({ relationshipStatus: relationship, workStatus: work });
        router.push('/(auth)/step7');
    };

    return (
        <OnboardingScaffold
            step={6}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Hayatındaki denge"
            subtitle="Bu bilgiler yorumlarını daha isabetli ve sana özel hale getirir."
            onNext={handleNext}
            nextDisabled={!relationship || !work}
        >
            <AppText variant="h3" color={Colors.purpleLight} style={styles.sectionLabel}>İlişki durumun</AppText>
            <View style={styles.grid}>
                {RELATIONSHIP_OPTIONS.map((o) => (
                    <Chip key={o.id} label={o.label} selected={relationship === o.id} onPress={() => setRelationship(o.id)} />
                ))}
            </View>

            <AppText variant="h3" color={Colors.purpleLight} style={[styles.sectionLabel, styles.secondLabel]}>Çalışma durumun</AppText>
            <View style={styles.grid}>
                {WORK_OPTIONS.map((o) => (
                    <Chip key={o.id} label={o.label} selected={work === o.id} onPress={() => setWork(o.id)} />
                ))}
            </View>
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    sectionLabel: { marginBottom: Spacing.md },
    secondLabel: { marginTop: Spacing.xxl },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
