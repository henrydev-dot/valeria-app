import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Button, Card, ProgressRing, LoadingView } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { ContentRepository } from '../../src/repositories/ContentRepository';
import type { Deity } from '../../src/types';

const ELEMENT_CRYSTALS: Record<string, string[]> = {
    'Ateş': ['Karnelyan', 'Sitrin', 'Kaplan Gözü'],
    'Su': ['Ay Taşı', 'Akuamarin', 'Ametist'],
    'Hava': ['Sitrin', 'Akik', 'Kuvars'],
    'Toprak': ['Yeşim', 'Oniks', 'Hematit'],
};

export default function Step8() {
    const profile = useUserStore((s) => s.profile);
    const [deity, setDeity] = useState<Deity | null>(null);
    const [ready, setReady] = useState(false);
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await ContentRepository.getOnboardingTest();
                const found = (data.deities as Deity[]).find((d) => d.id === profile.deityResult);
                setDeity(found || null);
            } catch {
                setDeity(null);
            } finally {
                setReady(true);
            }
        })();
    }, [profile.deityResult]);

    const handleFinish = () => {
        setFinishing(true);
        router.replace('/(tabs)');
    };

    if (!ready) {
        return (
            <Screen scroll={false}>
                <LoadingView text="Kozmik özetin hazırlanıyor..." />
            </Screen>
        );
    }

    const crystals = ELEMENT_CRYSTALS[profile.element || ''] || ['Ametist', 'Ay Taşı', 'Kuvars'];
    const energy = profile.energyScore || 0;

    return (
        <Screen>
            <AppText variant="label" color={Colors.textMuted}>SON ADIM</AppText>
            <AppText variant="title" style={styles.title}>Kozmik özetin hazır</AppText>
            <AppText variant="body" color={Colors.textSecondary} style={styles.subtitle}>
                Tebrikler {profile.name}! İşte sana özel kozmik profilin.
            </AppText>

            {energy > 0 ? (
                <Card glow style={styles.card}>
                    <View style={styles.energyRow}>
                        <ProgressRing progress={energy} size={96} strokeWidth={8} color={Colors.accentYellow}>
                            <AppText variant="h1" color={Colors.accentYellow}>{energy}</AppText>
                        </ProgressRing>
                        <View style={styles.energyInfo}>
                            <AppText variant="h3">Kozmik Enerji</AppText>
                            <AppText variant="caption" style={styles.energyDesc}>
                                Doğum haritandaki gezegen yerleşimlerinden türetilen genel enerji dengen.
                            </AppText>
                        </View>
                    </View>
                </Card>
            ) : null}

            <Card style={styles.card}>
                <View style={styles.zodiacRow}>
                    <ZodiacItem icon="sunny-outline" color={Colors.accentYellow} label="Güneş" value={profile.sunSign} />
                    <ZodiacItem icon="moon-outline" color={Colors.purpleLight} label="Ay" value={profile.moonSign} />
                    <ZodiacItem icon="arrow-up-outline" color={Colors.info} label="Yükselen" value={profile.risingSign} />
                </View>
            </Card>

            {deity ? (
                <Card glow style={styles.card}>
                    <AppText variant="label" color={Colors.textMuted}>MİTOLOJİK ARKETİPİN</AppText>
                    <AppText variant="title" color={Colors.accentYellow} style={styles.deityName}>{deity.nameTR}</AppText>
                    <AppText variant="callout" color={Colors.purpleLight}>{deity.titleTR}</AppText>
                    <AppText variant="body" style={styles.deityDesc}>{deity.descriptionTR}</AppText>
                    <TraitList label="Güçlü Yönler" icon="checkmark-circle" color={Colors.success} items={deity.strengthsTR} />
                    <TraitList label="Gelişim Alanları" icon="trending-up" color={Colors.warning} items={deity.growthTR} />
                </Card>
            ) : null}

            <Card style={styles.card}>
                <AppText variant="h3" style={styles.crystalTitle}>Önerilen Kristallerin</AppText>
                <View style={styles.crystalsRow}>
                    {crystals.map((c) => (
                        <View key={c} style={styles.crystalChip}>
                            <Ionicons name="diamond-outline" size={14} color={Colors.purpleLight} />
                            <AppText variant="caption" color={Colors.purpleLight}>{c}</AppText>
                        </View>
                    ))}
                </View>
            </Card>

            <Button title="Valeria'ya Başla" onPress={handleFinish} loading={finishing} style={styles.cta} />
        </Screen>
    );
}

function ZodiacItem({ icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
    return (
        <View style={styles.zodiacItem}>
            <Ionicons name={icon} size={24} color={color} />
            <AppText variant="caption" color={Colors.textMuted}>{label}</AppText>
            <AppText variant="bodyStrong">{value || '—'}</AppText>
        </View>
    );
}

function TraitList({ label, icon, color, items }: { label: string; icon: any; color: string; items: string[] }) {
    return (
        <View style={styles.traitSection}>
            <AppText variant="label" color={Colors.textMuted} style={styles.traitLabel}>{label}</AppText>
            {items.map((s, i) => (
                <View key={i} style={styles.traitRow}>
                    <Ionicons name={icon} size={15} color={color} />
                    <AppText variant="body" color={Colors.textSecondary}>{s}</AppText>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { marginTop: Spacing.xs },
    subtitle: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
    card: { marginBottom: Spacing.lg },
    energyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
    energyInfo: { flex: 1 },
    energyDesc: { marginTop: 2 },
    zodiacRow: { flexDirection: 'row', justifyContent: 'space-around' },
    zodiacItem: { alignItems: 'center', gap: Spacing.xs },
    deityName: { marginTop: Spacing.xs },
    deityDesc: { marginTop: Spacing.md, marginBottom: Spacing.lg },
    traitSection: { marginTop: Spacing.md },
    traitLabel: { marginBottom: Spacing.sm },
    traitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
    crystalTitle: { marginBottom: Spacing.md },
    crystalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    crystalChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.pill, backgroundColor: Colors.purpleA15,
        borderWidth: 1, borderColor: Colors.purpleA25,
    },
    cta: { marginTop: Spacing.md },
});
