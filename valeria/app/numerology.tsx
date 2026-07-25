import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Header, AppText, Button, Card, Skeleton } from '../src/components';
import { useUserStore } from '../src/stores/useUserStore';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../src/theme/spacing';
import { calculateAll } from '../src/utils/numerology';
import * as api from '../src/api';

const AI_COST = 45;

const NUMBER_DEFS = [
    { key: 'lifePath', label: 'Yaşam Yolu', color: '#F5C842', desc: 'Hayat amacın ve ana dersin' },
    { key: 'expression', label: 'Kader', color: '#A78BFA', desc: 'Doğuştan gelen yeteneklerin' },
    { key: 'soulUrge', label: 'Ruh Arzusu', color: '#60A5FA', desc: 'Kalbinin derin isteği' },
    { key: 'personality', label: 'Kişilik', color: '#F472B6', desc: 'Dışarıya yansıttığın yüz' },
] as const;

// Kısa yerel anlamlar — AI yorumu satın alınmadan da değer sunar.
const NUMBER_MEANINGS: Record<number, string> = {
    1: 'Liderlik, bağımsızlık ve öncülük enerjisi.',
    2: 'Denge, iş birliği ve diplomasi enerjisi.',
    3: 'Yaratıcılık, ifade ve neşe enerjisi.',
    4: 'Düzen, istikrar ve emek enerjisi.',
    5: 'Özgürlük, değişim ve macera enerjisi.',
    6: 'Şefkat, sorumluluk ve uyum enerjisi.',
    7: 'Bilgelik, sezgi ve içe dönüş enerjisi.',
    8: 'Güç, bolluk ve başarı enerjisi.',
    9: 'Tamamlanma, merhamet ve hizmet enerjisi.',
    11: 'Usta sayı: yüksek sezgi ve aydınlanma.',
    22: 'Usta sayı: büyük hayalleri inşa etme gücü.',
    33: 'Usta sayı: koşulsuz sevgi ve şifa.',
};

export default function NumerologyScreen() {
    const profile = useUserStore((s) => s.profile);
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const numbers = calculateAll(profile.name || '', profile.birthDate || '');

    const [aiResult, setAiResult] = useState<any>(null);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [buying, setBuying] = useState(false);

    // Daha önce satın alınmış AI yorumu varsa göster.
    useEffect(() => {
        (async () => {
            try {
                const p = await api.profile.get();
                if (p?.numerologyAI) setAiResult(p.numerologyAI);
            } catch { /* çevrimdışı — yerel anlamlar yeterli */ }
            finally { setLoadingSaved(false); }
        })();
    }, []);

    const buyAI = async () => {
        if (credits < AI_COST) {
            Alert.alert('Yetersiz Kredi', `Detaylı yorum için ${AI_COST} kredi gerekiyor (mevcut: ${credits}).`);
            return;
        }
        setBuying(true);
        try {
            const result = await api.readings.numerologyAI({
                lifePath: numbers.lifePath,
                expression: numbers.expression,
                soulUrge: numbers.soulUrge,
                personality: numbers.personality,
            });
            setAiResult(result);
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Yorum alınamadı.');
        } finally {
            setBuying(false);
        }
    };

    const aiTextFor = (key: string) => {
        if (!aiResult) return null;
        return aiResult[key] || null;
    };

    return (
        <Screen>
            <Header title="Numeroloji" />

            <LinearGradient
                colors={['#2D1B69', '#4C1D95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <Ionicons name="calculator-outline" size={26} color={Colors.accentYellow} />
                <AppText variant="h2" style={styles.heroTitle}>Sayıların Haritası</AppText>
                <AppText variant="callout" color={Colors.textSecondary} center>
                    İsmin ve doğum tarihin, Pisagor sistemine göre dört ana sayına dönüştü.
                </AppText>
            </LinearGradient>

            {/* Sayı halkaları */}
            <View style={styles.circleRow}>
                {NUMBER_DEFS.map((d) => (
                    <View key={d.key} style={styles.circleItem}>
                        <View style={[styles.circle, { borderColor: d.color }]}>
                            <AppText variant="h1" color={d.color}>{numbers[d.key]}</AppText>
                        </View>
                        <AppText variant="caption" color={Colors.textSecondary} center style={styles.circleLabel}>
                            {d.label}
                        </AppText>
                    </View>
                ))}
            </View>

            {/* Sayı kartları */}
            {NUMBER_DEFS.map((d) => {
                const value = numbers[d.key];
                const ai = aiTextFor(d.key);
                return (
                    <Card key={d.key} style={styles.numberCard}>
                        <View style={styles.numberHeader}>
                            <View style={[styles.numberBadge, { backgroundColor: d.color + '22', borderColor: d.color }]}>
                                <AppText variant="h3" color={d.color}>{value}</AppText>
                            </View>
                            <View style={styles.numberInfo}>
                                <AppText variant="h3">{d.label} Sayısı</AppText>
                                <AppText variant="caption" color={Colors.textMuted}>{d.desc}</AppText>
                            </View>
                        </View>
                        <AppText variant="body" style={styles.numberText}>
                            {ai || NUMBER_MEANINGS[value] || 'Bu sayı sana özel bir titreşim taşıyor.'}
                        </AppText>
                    </Card>
                );
            })}

            {/* Genel sentez / satın alma */}
            {loadingSaved ? (
                <Card style={styles.numberCard}>
                    <Skeleton height={14} />
                    <Skeleton height={14} width="85%" style={{ marginTop: Spacing.sm }} />
                </Card>
            ) : aiResult?.genel ? (
                <Card glow style={styles.numberCard}>
                    <View style={styles.synthHeader}>
                        <Ionicons name="sparkles" size={18} color={Colors.accentYellow} />
                        <AppText variant="h3">Valeria'nın Sentezi</AppText>
                    </View>
                    <AppText variant="body" style={styles.numberText}>{aiResult.genel}</AppText>
                </Card>
            ) : (
                <Card glow style={styles.buyCard}>
                    <Ionicons name="sparkles" size={26} color={Colors.accentYellow} />
                    <AppText variant="h3" center>Sayıların ne anlatıyor?</AppText>
                    <AppText variant="body" center color={Colors.textSecondary} style={styles.buyDesc}>
                        Valeria dört sayını doğum haritanla birleştirip sana özel derin bir yorum yazsın.
                    </AppText>
                    <Button
                        title={`Anlamlarını Öğren (${AI_COST} Kredi)`}
                        onPress={buyAI}
                        loading={buying}
                        icon={<Ionicons name="key-outline" size={16} color={Colors.textOnAccent} />}
                    />
                </Card>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.purpleA25,
    },
    heroTitle: { marginTop: Spacing.xs },
    circleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.xs,
    },
    circleItem: { alignItems: 'center', flex: 1 },
    circle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface1,
    },
    circleLabel: { marginTop: Spacing.sm, fontWeight: FontWeight.semibold },
    numberCard: { marginBottom: Spacing.lg },
    numberHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    numberBadge: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
    },
    numberInfo: { flex: 1, gap: 2 },
    numberText: { lineHeight: 22 },
    synthHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    buyCard: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    buyDesc: { marginBottom: Spacing.md },
});
