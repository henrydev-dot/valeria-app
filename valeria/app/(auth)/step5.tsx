import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

const CITIES = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep',
    'Konya', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Samsun',
    'Denizli', 'Trabzon', 'Malatya', 'Erzurum', 'Van', 'Batman',
    'Elazığ', 'Manisa', 'Balıkesir', 'Kahramanmaraş', 'Sakarya',
    'Hatay', 'Muğla', 'Aydın', 'Afyonkarahisar', 'Kütahya',
    'Tekirdağ', 'Edirne', 'Çanakkale', 'Kırklareli', 'Zonguldak',
    'Bartın', 'Karabük', 'Bolu', 'Düzce', 'Yalova', 'Kocaeli',
    'Isparta', 'Burdur', 'Uşak', 'Şanlıurfa', 'Mardin', 'Siirt',
    'Şırnak', 'Hakkari', 'Muş', 'Bitlis', 'Tunceli', 'Bingöl',
    'Artvin', 'Rize', 'Giresun', 'Ordu', 'Amasya', 'Tokat',
    'Sivas', 'Yozgat', 'Kırşehir', 'Nevşehir', 'Aksaray', 'Niğde',
    'Kars', 'Iğdır', 'Ağrı', 'Ardahan', 'Osmaniye', 'Adalet',
    'Kırıkkale', 'Çankırı', 'Kastamonu', 'Sinop', 'Çorum',
];

export default function Step5() {
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Türkiye');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const setProfile = useUserStore((s) => s.setProfile);

    const filteredCities = city.length > 0
        ? CITIES.filter((c) => c.toLowerCase().includes(city.toLowerCase()))
        : CITIES;

    const handleNext = () => {
        if (city.trim().length < 2) return;
        setProfile({ birthCity: city.trim(), birthCountry: country.trim() });
        router.push('/(auth)/step6');
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    <Text style={styles.step}>5 / 8</Text>
                    <Text style={styles.title}>Doğum Yeriniz</Text>
                    <Text style={styles.subtitle}>
                        Natal haritanızı hazırlamak için doğum yerinizi belirtin.
                    </Text>

                    <Text style={styles.label}>Şehir</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örneğin: İstanbul"
                        placeholderTextColor={Colors.textMuted}
                        value={city}
                        onChangeText={(t) => {
                            setCity(t);
                            setShowSuggestions(true);
                        }}
                    />
                    {showSuggestions && filteredCities.length > 0 && (
                        <View style={styles.suggestions}>
                            {filteredCities.slice(0, 8).map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setCity(c);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <Text style={styles.suggestionText}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <Text style={[styles.label, { marginTop: Spacing.xl }]}>Ülke</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Türkiye"
                        placeholderTextColor={Colors.textMuted}
                        value={country}
                        onChangeText={setCountry}
                    />
                </View>
                <View style={styles.footer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Text style={styles.backText}>← Geri</Text>
                        </TouchableOpacity>
                        <PrimaryButton
                            title="Devam Et"
                            onPress={handleNext}
                            disabled={city.trim().length < 2}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        marginBottom: Spacing.xxl,
        lineHeight: 22,
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.lg,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    suggestions: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: Spacing.xs,
    },
    suggestionItem: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    suggestionText: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
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
