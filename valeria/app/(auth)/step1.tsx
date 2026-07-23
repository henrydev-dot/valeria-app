import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScaffold, Field } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

export default function Step1() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);
    const [name, setName] = useState(profile.name || '');

    const handleNext = () => {
        setProfile({ name: name.trim() });
        router.push('/(auth)/step2');
    };

    return (
        <OnboardingScaffold
            step={1}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Sana nasıl hitap edelim?"
            subtitle="İsmini günlük rehberliğinde ve kişisel yorumlarında kullanacağız."
            onNext={handleNext}
            nextDisabled={name.trim().length < 2}
        >
            <Field
                label="Adın"
                placeholder="Örneğin: Deniz"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                maxLength={40}
                onSubmitEditing={() => name.trim().length >= 2 && handleNext()}
                containerStyle={styles.field}
            />
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({ field: { marginTop: 4 } });
