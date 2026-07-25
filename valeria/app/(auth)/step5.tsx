import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingScaffold, AppText, Field, SegmentedControl, SelectModal, SelectField } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { TOTAL_ONBOARDING_STEPS } from '../../src/data/onboardingOptions';

// 81 il + 973 ilçe (isimler; koordinatlar backend'de çözülür)
const TR_DISTRICTS: Record<string, string[]> = require('../../content/tr_districts.json');
const TR_PROVINCES = Object.keys(TR_DISTRICTS).sort((a, b) => a.localeCompare(b, 'tr'));

export default function Step5() {
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);

    const inTurkey = !profile.birthCountry || profile.birthCountry === 'Türkiye';
    const [mode, setMode] = useState(inTurkey ? 0 : 1); // 0: Türkiye, 1: Yurt dışı
    const [city, setCity] = useState(profile.birthCity || '');
    const [district, setDistrict] = useState(profile.birthDistrict || '');
    const [foreignCity, setForeignCity] = useState(inTurkey ? '' : profile.birthCity || '');
    const [country, setCountry] = useState(inTurkey ? '' : profile.birthCountry || '');
    const [picker, setPicker] = useState<'city' | 'district' | null>(null);

    const districts = useMemo(
        () => (city && TR_DISTRICTS[city] ? [...TR_DISTRICTS[city]].sort((a, b) => a.localeCompare(b, 'tr')) : []),
        [city]
    );

    const isValid = mode === 0
        ? city.length > 0 && district.length > 0
        : foreignCity.trim().length >= 2 && country.trim().length >= 2;

    const handleNext = () => {
        if (!isValid) return;
        Keyboard.dismiss();
        if (mode === 0) {
            setProfile({ birthCity: city, birthDistrict: district, birthCountry: 'Türkiye' });
        } else {
            setProfile({ birthCity: foreignCity.trim(), birthDistrict: '', birthCountry: country.trim() });
        }
        router.push('/(auth)/step6');
    };

    return (
        <OnboardingScaffold
            step={5}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            title="Doğum yerin"
            subtitle="Yükselen burcun doğduğun yere göre değişir — il ve ilçeni seç, gerisini biz hesaplayalım."
            onNext={handleNext}
            nextDisabled={!isValid}
        >
            <SegmentedControl
                segments={['Türkiye', 'Yurt Dışı']}
                value={mode}
                onChange={(i) => { Keyboard.dismiss(); setMode(i); }}
                style={styles.segment}
            />

            {mode === 0 ? (
                <>
                    <SelectField
                        label="İl"
                        value={city}
                        placeholder="İl seç"
                        icon={<Ionicons name="location-outline" size={18} color={Colors.accentYellow} />}
                        onPress={() => setPicker('city')}
                    />
                    <SelectField
                        label="İlçe"
                        value={district}
                        placeholder={city ? 'İlçe seç' : 'Önce il seç'}
                        icon={<Ionicons name="map-outline" size={18} color={Colors.purpleLight} />}
                        onPress={() => setPicker('district')}
                        disabled={!city}
                    />
                    {city && district ? (
                        <View style={styles.confirm}>
                            <Ionicons name="sparkles" size={15} color={Colors.accentYellow} />
                            <AppText variant="callout" color={Colors.textSecondary}>
                                {district}, {city} — doğum haritan bu konuma göre hesaplanacak.
                            </AppText>
                        </View>
                    ) : null}
                </>
            ) : (
                <>
                    <Field
                        label="Şehir"
                        placeholder="Örneğin: Berlin"
                        value={foreignCity}
                        onChangeText={setForeignCity}
                        autoCapitalize="words"
                        returnKeyType="next"
                        icon={<Ionicons name="location-outline" size={18} color={Colors.textMuted} />}
                    />
                    <Field
                        label="Ülke"
                        placeholder="Örneğin: Almanya"
                        value={country}
                        onChangeText={setCountry}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        icon={<Ionicons name="earth-outline" size={18} color={Colors.textMuted} />}
                    />
                    <View style={styles.confirm}>
                        <Ionicons name="information-circle-outline" size={15} color={Colors.textMuted} />
                        <AppText variant="caption" color={Colors.textMuted} style={styles.confirmText}>
                            Yurt dışı doğumlarda saat dilimi ve koordinatlar ülkene göre tahmin edilir.
                        </AppText>
                    </View>
                </>
            )}

            <SelectModal
                visible={picker === 'city'}
                title="Doğduğun il"
                options={TR_PROVINCES}
                selected={city}
                searchPlaceholder="İl ara..."
                onSelect={(v) => {
                    setCity(v);
                    if (v !== city) setDistrict('');
                    // İl seçilince akışı hızlandır: doğrudan ilçe seçimine geç
                    setPicker('district');
                }}
                onClose={() => setPicker(null)}
            />
            <SelectModal
                visible={picker === 'district'}
                title={`${city || 'İlçe'} ilçeleri`}
                options={districts}
                selected={district}
                searchPlaceholder="İlçe ara..."
                onSelect={(v) => { setDistrict(v); setPicker(null); }}
                onClose={() => setPicker(null)}
            />
        </OnboardingScaffold>
    );
}

const styles = StyleSheet.create({
    segment: { marginBottom: Spacing.xl },
    confirm: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: Colors.goldA12,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.xs,
    },
    confirmText: { flex: 1 },
});
