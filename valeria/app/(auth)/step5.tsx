import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScaffold, AppText, Field } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { TURKISH_CITIES, TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

export default function Step5() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);
    const [city, setCity] = useState(profile.birthCity || '');
    const [country, setCountry] = useState(profile.birthCountry || 'Türkiye');
    const [focused, setFocused] = useState(false);

    const suggestions =
        focused && city.trim().length > 0
            ? TURKISH_CITIES.filter((c) => c.toLocaleLowerCase('tr').includes(city.toLocaleLowerCase('tr'))).slice(0, 6)
            : [];

    const handleNext = () => {
        if (city.trim().length < 2) return;
        setProfile({ birthCity: city.trim(), birthCountry: country.trim() || 'Türkiye' });
        router.push('/(auth)/step6');
    };

    return (
        <OnboardingScaffold
            step={5}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Doğum yerin"
            subtitle="Doğum haritanı doğru hesaplamak için nerede doğduğunu öğrenelim."
            onNext={handleNext}
            nextDisabled={city.trim().length < 2}
            scroll={false}
        >
            <View style={styles.cityWrap}>
                <Field
                    label="Şehir"
                    placeholder="Örneğin: İstanbul"
                    value={city}
                    onChangeText={(t) => { setCity(t); setFocused(true); }}
                    onFocus={() => setFocused(true)}
                    autoCapitalize="words"
                    icon={<Ionicons name="location-outline" size={18} color={Colors.textMuted} />}
                    containerStyle={styles.noMargin}
                />
                {suggestions.length > 0 ? (
                    <View style={styles.suggestions}>
                        {suggestions.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={styles.suggestionItem}
                                onPress={() => { setCity(c); setFocused(false); }}
                            >
                                <Ionicons name="location" size={16} color={Colors.purpleLight} />
                                <AppText variant="body" color={Colors.textPrimary}>{c}</AppText>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </View>

            <Field
                label="Ülke"
                placeholder="Türkiye"
                value={country}
                onChangeText={setCountry}
                autoCapitalize="words"
                icon={<Ionicons name="earth-outline" size={18} color={Colors.textMuted} />}
                containerStyle={styles.countryField}
            />
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    cityWrap: { position: 'relative', zIndex: 10, marginBottom: Spacing.lg },
    noMargin: { marginBottom: 0 },
    countryField: { marginTop: Spacing.sm },
    suggestions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: Spacing.xs,
        backgroundColor: Colors.surface2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        overflow: 'hidden',
        zIndex: 20,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
});
