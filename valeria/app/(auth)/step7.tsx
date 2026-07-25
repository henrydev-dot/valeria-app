import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, AppText, Button } from '../../src/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';

const STAGES = [
    'Doğum bilgilerin işleniyor...',
    'Güneş, Ay ve Yükselen burcun hesaplanıyor...',
    'Sana en uygun tanrı arketipi belirleniyor...',
    'Kozmik profilin hazırlanıyor...',
];

export default function Step7() {
    const profile = useUserStore((s) => s.profile);
    const onboarding = useUserStore((s) => s.onboarding);
    const [stage, setStage] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const run = useCallback(async () => {
        setError(null);
        setStage(0);
        // Advance status text for perceived progress.
        const timers = STAGES.map((_, i) =>
            setTimeout(() => setStage(i), i * 700)
        );
        try {
            // Backend is the single source of truth for signs/deity/energy.
            await onboarding({
                name: profile.name,
                gender: profile.gender,
                birthDate: profile.birthDate,
                birthTime: profile.birthTime,
                birthCity: profile.birthCity,
                birthDistrict: profile.birthDistrict || '',
                birthCountry: profile.birthCountry || 'Türkiye',
                relationshipStatus: profile.relationshipStatus,
                workStatus: profile.workStatus,
            });
            timers.forEach(clearTimeout);
            router.replace('/(auth)/step8');
        } catch (e: any) {
            timers.forEach(clearTimeout);
            setError(e?.message || 'Profilin oluşturulurken bir sorun oluştu. İnternet bağlantını kontrol edip tekrar dene.');
        }
    }, [profile, onboarding]);

    useEffect(() => {
        run();
    }, []);

    if (error) {
        return (
            <GradientBackground>
                <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
                    <Ionicons name="cloud-offline-outline" size={48} color={Colors.warning} />
                    <AppText variant="h1" center style={styles.errTitle}>Bir sorun oluştu</AppText>
                    <AppText variant="body" center color={Colors.textSecondary} style={styles.errMsg}>{error}</AppText>
                    <View style={styles.actions}>
                        <Button title="Tekrar Dene" onPress={run} />
                        <Button title="Geri Dön" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
                    </View>
                </SafeAreaView>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color={Colors.accentYellow} style={styles.spinner} />
                <AppText variant="title" center>Kozmik profilin hazırlanıyor</AppText>
                <AppText variant="body" center color={Colors.accentYellow} style={styles.status}>
                    {STAGES[stage]}
                </AppText>
                <AppText variant="caption" center style={styles.hint}>
                    Doğum bilgilerine göre haritan çıkarılıyor ve sana özel arketipin belirleniyor.
                </AppText>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
    spinner: { marginBottom: Spacing.xl },
    status: { marginTop: Spacing.md },
    hint: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
    errTitle: { marginTop: Spacing.lg },
    errMsg: { marginTop: Spacing.md, paddingHorizontal: Spacing.md },
    actions: { alignSelf: 'stretch', marginTop: Spacing.xxl, paddingHorizontal: Spacing.md },
    backBtn: { marginTop: Spacing.md },
});
