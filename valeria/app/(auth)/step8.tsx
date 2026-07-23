import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, KismetCard, PrimaryButton, ProgressRing } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { ContentRepository } from '../../src/repositories/ContentRepository';
import type { Deity } from '../../src/types';

export default function Step8() {
    const { profile, setProfile, saveProfile } = useUserStore();
    const [deity, setDeity] = useState<Deity | null>(null);
    const [loading, setLoading] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    // On mount: call onboarding API immediately to get real data, then show
    useEffect(() => {
        (async () => {
            try {
                // 1. Send onboarding data to backend → calculates sun/moon/rising
                await useUserStore.getState().onboarding({
                    name: profile.name,
                    gender: profile.gender,
                    birthDate: profile.birthDate,
                    birthTime: profile.birthTime,
                    birthCity: profile.birthCity,
                    birthCountry: profile.birthCountry || 'Türkiye',
                    relationshipStatus: profile.relationshipStatus,
                    workStatus: profile.workStatus,
                });

                // 2. Reload profile from backend so we get real calculated signs
                await useUserStore.getState().loadProfile();

                // 3. Load deity data
                const data = await ContentRepository.getOnboardingTest();
                const updatedProfile = useUserStore.getState().profile;
                const found = (data.deities as Deity[]).find(
                    (d) => d.id === updatedProfile.deityResult
                );
                setDeity(found || null);
            } catch (e: any) {
                console.error('Step8 data load error:', e?.message);
            } finally {
                setDataReady(true);
            }
        })();
    }, []);

    // Loading screen until backend data is ready
    if (!dataReady) {
        return (
            <GradientBackground>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.accentYellow} />
                    <Text style={styles.loadingText}>Kozmik profiliniz hazırlanıyor...</Text>
                    <Text style={styles.loadingSubtext}>Yıldız haritanız hesaplanıyor</Text>
                </View>
            </GradientBackground>
        );
    }

    const handleFinish = async () => {
        setLoading(true);
        try {
            // Profile already saved via onboarding call above, just navigate
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Bir sorun oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.step}>8 / 8</Text>
                <Text style={styles.title}>Kozmik Özetiniz</Text>
                <Text style={styles.subtitle}>
                    Tebrikler, {profile.name}! İşte size özel kozmik profiliniz.
                </Text>

                {/* Energy Score */}
                <KismetCard glow style={styles.energyCard}>
                    <View style={styles.energyRow}>
                        <ProgressRing
                            progress={profile.energyScore}
                            size={100}
                            strokeWidth={8}
                            color={Colors.accentYellow}
                        >
                            <Text style={styles.energyScore}>{profile.energyScore}</Text>
                        </ProgressRing>
                        <View style={styles.energyInfo}>
                            <Text style={styles.energyLabel}>Enerji Skoru</Text>
                            <Text style={styles.energyDesc}>
                                Seçimlerinize ve kozmik profilinize dayalı kişisel enerji puanınız.
                            </Text>
                        </View>
                    </View>
                </KismetCard>

                {/* Zodiac Summary */}
                <KismetCard style={styles.card}>
                    <View style={styles.zodiacRow}>
                        <View style={styles.zodiacItem}>
                            <Ionicons name="sunny-outline" size={24} color={Colors.accentYellow} />
                            <Text style={styles.zodiacLabel}>Güneş</Text>
                            <Text style={styles.zodiacValue}>{profile.sunSign || '—'}</Text>
                        </View>
                        <View style={styles.zodiacItem}>
                            <Ionicons name="moon-outline" size={24} color={Colors.purpleLight} />
                            <Text style={styles.zodiacLabel}>Ay</Text>
                            <Text style={styles.zodiacValue}>{profile.moonSign || '—'}</Text>
                        </View>
                        <View style={styles.zodiacItem}>
                            <Ionicons name="arrow-up-outline" size={24} color={Colors.info} />
                            <Text style={styles.zodiacLabel}>Yükselen</Text>
                            <Text style={styles.zodiacValue}>{profile.risingSign || '—'}</Text>
                        </View>
                    </View>
                </KismetCard>

                {/* Deity Result */}
                {deity && (
                    <KismetCard glow style={styles.card}>
                        <Text style={styles.deityTitle}>Mitolojik Ruh İkiziniz</Text>
                        <Text style={styles.deityName}>{deity.nameTR}</Text>
                        <Text style={styles.deitySubtitle}>{deity.titleTR}</Text>
                        <Text style={styles.deityDesc}>{deity.descriptionTR}</Text>
                        <View style={styles.traitSection}>
                            <Text style={styles.traitLabel}>Güçlü Yönler</Text>
                            {deity.strengthsTR.map((s, i) => (
                                <Text key={i} style={styles.traitItem}>
                                    <Ionicons name="checkmark" size={14} color={Colors.success} /> {s}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.traitSection}>
                            <Text style={styles.traitLabel}>Gelişim Alanları</Text>
                            {deity.growthTR.map((s, i) => (
                                <Text key={i} style={styles.traitItem}>
                                    <Ionicons name="arrow-up" size={14} color={Colors.warning} /> {s}
                                </Text>
                            ))}
                        </View>
                    </KismetCard>
                )}

                {/* Crystal */}
                <KismetCard style={styles.card}>
                    <Text style={styles.sectionTitle}>Favori Kristalleriniz</Text>
                    <View style={styles.crystalsRow}>
                        {(['Ametist', 'Ay Taşı', 'Kuvars']).map((c: string) => (
                            <View key={c} style={styles.crystalChip}>
                                <Ionicons name="diamond-outline" size={14} color={Colors.purpleLight} />
                                <Text style={styles.crystalText}>{c}</Text>
                            </View>
                        ))}
                    </View>
                </KismetCard>

                <PrimaryButton
                    title={loading ? 'Yükleniyor...' : 'Devam Et'}
                    onPress={handleFinish}
                    style={styles.cta}
                    disabled={loading}
                />
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 60,
    },
    step: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: Spacing.xxl,
    },
    energyCard: {
        marginBottom: Spacing.lg,
    },
    energyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xl,
    },
    energyScore: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.accentYellow,
    },
    energyInfo: {
        flex: 1,
    },
    energyLabel: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    energyDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    card: {
        marginBottom: Spacing.lg,
    },
    zodiacRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    zodiacItem: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    zodiacLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    zodiacValue: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    deityTitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    deityName: {
        fontSize: FontSize.title,
        fontWeight: '700',
        color: Colors.accentYellow,
        marginBottom: Spacing.xs,
    },
    deitySubtitle: {
        fontSize: FontSize.md,
        color: Colors.purpleLight,
        marginBottom: Spacing.md,
    },
    deityDesc: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    traitSection: {
        marginBottom: Spacing.md,
    },
    traitLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    traitItem: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    crystalsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    crystalChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purple + '20',
        borderWidth: 1,
        borderColor: Colors.purple + '40',
    },
    crystalText: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        fontWeight: '500',
    },
    cta: {
        marginTop: Spacing.xl,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        marginTop: Spacing.lg,
        fontWeight: '600',
    },
    loadingSubtext: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: Spacing.sm,
    },
});
