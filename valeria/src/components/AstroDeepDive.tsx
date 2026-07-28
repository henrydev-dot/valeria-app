import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Modal, TouchableOpacity, TextInput, Alert, ScrollView,
    KeyboardAvoidingView, Keyboard, Platform, Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Card } from './Card';
import { Button } from './Button';
import { Skeleton } from './Feedback';
import { useEntitlementsStore } from '../stores/useEntitlementsStore';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../theme/spacing';
import * as api from '../api';

const INSIGHT_COST = 10;

// TR gezegen adı → natal retro anlamı sözlüğündeki İngilizce anahtar
const PLANET_TR_TO_EN: Record<string, string> = {
    'Merkür': 'Mercury', 'Venüs': 'Venus', 'Mars': 'Mars', 'Jüpiter': 'Jupiter',
    'Satürn': 'Saturn', 'Uranüs': 'Uranus', 'Neptün': 'Neptune', 'Plüton': 'Pluto',
};

const CAL_TYPE_COLOR: Record<string, string> = {
    warning: Colors.warning,
    alert: Colors.error,
    danger: Colors.error,
    info: Colors.info,
};

interface HouseRow {
    house: number;
    sign: string;
    meaning: string;
    planets: Array<{ name: string; sign: string; degree: number; isRetrograde?: boolean }>;
}

/**
 * Astroloji sayfasının derin katmanı: Evler (dokun → Valeria yorumlasın),
 * natal Retrolar ve 2026 Retro Takvimi.
 */
export function AstroDeepDive({ analysis }: { analysis: any }) {
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const credits = useEntitlementsStore((s) => s.credits);

    const [retroData, setRetroData] = useState<any>(null);
    const [retroLoading, setRetroLoading] = useState(true);
    const [selected, setSelected] = useState<HouseRow | null>(null);
    const [question, setQuestion] = useState('');
    const [insight, setInsight] = useState<string>('');
    const [insightLoading, setInsightLoading] = useState(false);
    // Sayfa uzamasın: bölümler önizleme gösterir, istenirse açılır.
    const [showAllHouses, setShowAllHouses] = useState(false);
    const [showAllCal, setShowAllCal] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await api.astrology.retroCalendar();
                setRetroData(data);
            } catch { /* takvim gelmezse bölüm gizlenir */ }
            finally { setRetroLoading(false); }
        })();
    }, []);

    const houses: HouseRow[] = Array.isArray(analysis?.houses) ? analysis.houses : [];
    const natalRetros: any[] = Array.isArray(analysis?.retrogradePlanets) ? analysis.retrogradePlanets : [];

    const [insightSavedAt, setInsightSavedAt] = useState<string | null>(null);

    const openHouse = (h: HouseRow) => {
        setSelected(h);
        setQuestion('');
        // Bu ev için KAYITLI yorum varsa kredi harcamadan direkt göster;
        // kullanıcı isterse "Yeniden Yorumlat" ile krediyle günceller.
        const saved = analysis?.houseInsights?.[String(h.house)];
        setInsight(saved?.insight || '');
        setInsightSavedAt(saved?.at || null);
    };

    const askInsight = async () => {
        if (!selected) return;
        if (credits < INSIGHT_COST) {
            Alert.alert('Yetersiz Kredi', `Bu yorum için ${INSIGHT_COST} kredi gerekiyor (mevcut: ${credits}).`);
            return;
        }
        setInsightLoading(true);
        try {
            const res = await api.astrology.houseInsight(selected.house, question.trim() || undefined);
            setInsight(res.insight || '');
            setInsightSavedAt(res.savedAt || new Date().toISOString());
            // Yerel analiz nesnesini de güncelle ki modal kapatılıp açılınca
            // yeni kayıt görünsün (sayfa yeniden yüklenmeden).
            if (analysis) {
                analysis.houseInsights = {
                    ...(analysis.houseInsights || {}),
                    [String(selected.house)]: { insight: res.insight, question: question.trim() || undefined, at: res.savedAt },
                };
            }
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Yorum alınamadı');
        } finally {
            setInsightLoading(false);
        }
    };

    return (
        <>
            {/* ── EVLER ── */}
            {houses.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="home-analytics" size={18} color={Colors.accentYellow} />
                        <AppText variant="h2" style={styles.sectionTitle}>Evlerin</AppText>
                    </View>
                    <AppText variant="caption" color={Colors.textMuted} style={styles.sectionSub}>
                        Hangi evinde hangi burç var? Dokun; dilersen Valeria o yerleşimi senin için yorumlasın.
                    </AppText>
                    <Card padded={false}>
                        {(showAllHouses ? houses : houses.slice(0, 4)).map((h, i, arr) => (
                            <TouchableOpacity
                                key={h.house}
                                style={[styles.houseRow, i < arr.length - 1 && styles.houseRowBorder]}
                                onPress={() => openHouse(h)}
                                accessibilityRole="button"
                                accessibilityLabel={`${h.house}. ev, ${h.sign}. Detay için dokun.`}
                            >
                                <View style={styles.houseNo}>
                                    <AppText variant="bodyStrong" color={Colors.accentYellow}>{h.house}</AppText>
                                </View>
                                <View style={styles.houseInfo}>
                                    <AppText variant="bodyStrong">{h.sign}</AppText>
                                    <AppText variant="caption" color={Colors.textMuted} numberOfLines={1}>
                                        {(h.meaning || '').split(':')[0]}
                                    </AppText>
                                </View>
                                {h.planets?.length > 0 && (
                                    <View style={styles.planetBadge}>
                                        <AppText variant="label" color={Colors.purpleLight}>
                                            {h.planets.map(p => p.name).join(' · ')}
                                        </AppText>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </Card>
                    {houses.length > 4 && (
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setShowAllHouses(!showAllHouses)}
                            accessibilityRole="button"
                        >
                            <AppText variant="callout" color={Colors.accentYellow} style={styles.expandText}>
                                {showAllHouses ? 'Küçült' : `12 Evin Tümünü Gör`}
                            </AppText>
                            <Ionicons
                                name={showAllHouses ? 'chevron-up' : 'chevron-down'}
                                size={15}
                                color={Colors.accentYellow}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── NATAL RETROLAR ── */}
            {natalRetros.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="orbit" size={18} color={Colors.purpleLight} />
                        <AppText variant="h2" style={styles.sectionTitle}>Doğum Haritandaki Retrolar</AppText>
                    </View>
                    <AppText variant="caption" color={Colors.textMuted} style={styles.sectionSub}>
                        Doğduğun anda geri gidiyormuş görünen gezegenler — enerjileri içe dönük çalışır.
                    </AppText>
                    {natalRetros.map((r: any) => {
                        const meaning = retroData?.natalRetroMeanings?.[PLANET_TR_TO_EN[r.name] || ''] || '';
                        return (
                            <Card key={r.name} style={styles.retroCard}>
                                <View style={styles.retroHeader}>
                                    <AppText variant="bodyStrong" color={Colors.purpleLight}>
                                        {r.name} Retro
                                    </AppText>
                                    <AppText variant="caption" color={Colors.textMuted}>
                                        {r.sign} · {r.house}. ev
                                    </AppText>
                                </View>
                                {meaning ? (
                                    <AppText variant="body" style={styles.retroText}>{meaning}</AppText>
                                ) : null}
                            </Card>
                        );
                    })}
                </View>
            )}

            {/* ── RETRO TAKVİMİ (yüklenirken iskelet — sayfa zıplamasın) ── */}
            {retroLoading && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="calendar-sync" size={18} color={Colors.info} />
                        <AppText variant="h2" style={styles.sectionTitle}>Retro Takvimi 2026</AppText>
                    </View>
                    {[0, 1, 2].map((i) => (
                        <Card key={i} style={styles.calCard}>
                            <Skeleton height={14} width="55%" />
                            <Skeleton height={11} width="40%" style={styles.skelGap} />
                            <Skeleton height={11} width="90%" style={styles.skelGap} />
                        </Card>
                    ))}
                </View>
            )}
            {!retroLoading && retroData?.calendar?.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="calendar-sync" size={18} color={Colors.info} />
                        <AppText variant="h2" style={styles.sectionTitle}>Retro Takvimi 2026</AppText>
                    </View>

                    {retroData.currentlyRetro?.length > 0 && (
                        <View style={styles.nowRetroRow}>
                            <MaterialCommunityIcons name="alert-decagram" size={15} color={Colors.warning} />
                            <AppText variant="callout" color={Colors.warning}>
                                Şu an retroda: {retroData.currentlyRetro.join(', ')}
                            </AppText>
                        </View>
                    )}

                    {(showAllCal ? retroData.calendar : retroData.calendar.slice(0, 3)).map((c: any, i: number) => {
                        const color = CAL_TYPE_COLOR[c.type] || Colors.info;
                        return (
                            <Card key={i} style={[styles.calCard, { borderLeftColor: color }]}>
                                <View style={styles.calHeader}>
                                    <AppText variant="bodyStrong">{c.planet} Retrosu</AppText>
                                    <AppText variant="caption" color={color}>{c.sign}</AppText>
                                </View>
                                <AppText variant="caption" color={Colors.textSecondary} style={styles.calPeriod}>
                                    {c.period}
                                </AppText>
                                <AppText variant="caption" color={Colors.textMuted} style={styles.calNote}>
                                    {c.note}
                                </AppText>
                            </Card>
                        );
                    })}
                    {retroData.calendar.length > 3 && (
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setShowAllCal(!showAllCal)}
                            accessibilityRole="button"
                        >
                            <AppText variant="callout" color={Colors.accentYellow} style={styles.expandText}>
                                {showAllCal ? 'Küçült' : `Tüm Takvimi Gör (${retroData.calendar.length})`}
                            </AppText>
                            <Ionicons
                                name={showAllCal ? 'chevron-up' : 'chevron-down'}
                                size={15}
                                color={Colors.accentYellow}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── EV DETAY MODALI ── */}
            {/* KeyboardAvoidingView: soru yazarken alan klavyenin ALTINDA kalmasın.
                Boş alana dokunma: klavye açıksa klavyeyi, değilse modalı kapatır. */}
            <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
                <KeyboardAvoidingView
                    style={styles.overlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Pressable
                        style={styles.overlayDismiss}
                        onPress={() => {
                            if (Keyboard.isVisible()) Keyboard.dismiss();
                            else setSelected(null);
                        }}
                        accessibilityLabel="Kapat"
                    />
                    <View style={styles.sheet}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                        >
                            <View style={styles.sheetHeader}>
                                <View style={styles.houseNoLg}>
                                    <AppText variant="h2" color={Colors.accentYellow}>{selected?.house}</AppText>
                                </View>
                                <View style={styles.sheetHeadText}>
                                    <AppText variant="h2">{selected?.house}. Ev — {selected?.sign}</AppText>
                                    {selected?.planets?.length ? (
                                        <AppText variant="caption" color={Colors.purpleLight}>
                                            Bu evde: {selected.planets.map(p => `${p.name}${p.isRetrograde ? ' (R)' : ''}`).join(', ')}
                                        </AppText>
                                    ) : (
                                        <AppText variant="caption" color={Colors.textMuted}>Bu evde gezegen yok</AppText>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSelected(null)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Kapat"
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <AppText variant="body" style={styles.sheetMeaning}>{selected?.meaning}</AppText>

                            {insight ? (
                                <>
                                    <Card glow style={styles.insightCard}>
                                        <View style={styles.insightHeader}>
                                            <Ionicons name="sparkles" size={15} color={Colors.accentYellow} />
                                            <AppText variant="label" color={Colors.accentYellow}>Valeria'nın Yorumu</AppText>
                                            {insightSavedAt ? (
                                                <AppText variant="caption" color={Colors.textMuted} style={styles.insightDate}>
                                                    {new Date(insightSavedAt).toLocaleDateString('tr-TR')}
                                                </AppText>
                                            ) : null}
                                        </View>
                                        <AppText variant="body" style={styles.insightText}>{insight}</AppText>
                                    </Card>
                                    {/* Kayıtlı yorum ücretsiz görünür; yenilemek kredi ister */}
                                    <Button
                                        title={`Yeniden Yorumlat (${INSIGHT_COST} Kredi)`}
                                        variant="secondary"
                                        size="md"
                                        onPress={() => { setInsight(''); setQuestion(''); }}
                                        icon={<Ionicons name="refresh" size={14} color={Colors.textPrimary} />}
                                    />
                                </>
                            ) : insightLoading ? (
                                <Card style={styles.insightCard}>
                                    <Skeleton height={13} />
                                    <Skeleton height={13} width="90%" style={styles.skelGap} />
                                    <Skeleton height={13} width="70%" style={styles.skelGap} />
                                </Card>
                            ) : (
                                <>
                                    <AppText variant="label" color={Colors.textMuted} style={styles.qLabel}>
                                        Merak ettiğin bir şey var mı? (isteğe bağlı)
                                    </AppText>
                                    <TextInput
                                        style={styles.qInput}
                                        placeholder={`Örn: ${selected?.house}. evdeki ${selected?.sign} aşk hayatımı nasıl etkiler?`}
                                        placeholderTextColor={Colors.textMuted}
                                        value={question}
                                        onChangeText={setQuestion}
                                        multiline
                                    />
                                    <Button
                                        title={`Valeria Yorumlasın (${INSIGHT_COST} Kredi)`}
                                        onPress={askInsight}
                                        icon={<Ionicons name="sparkles" size={15} color={Colors.textOnAccent} />}
                                    />
                                </>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: Spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
    sectionTitle: { flex: 1 },
    sectionSub: { marginBottom: Spacing.md },
    // Evler
    houseRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    },
    houseRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
    houseNo: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: Colors.goldA12, borderWidth: 1, borderColor: Colors.borderAccent,
        alignItems: 'center', justifyContent: 'center',
    },
    houseInfo: { flex: 1, gap: 1 },
    planetBadge: {
        backgroundColor: Colors.purpleA15, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm, paddingVertical: 3, maxWidth: 130,
    },
    // Bölüm aç/kapa
    expandBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: Spacing.md,
    },
    expandText: { fontWeight: FontWeight.bold },
    // Retrolar
    retroCard: { marginBottom: Spacing.md },
    retroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    retroText: { lineHeight: 21 },
    // Takvim
    nowRetroRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: 'rgba(251, 191, 36, 0.10)', borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.30)',
    },
    calCard: { marginBottom: Spacing.md, borderLeftWidth: 3 },
    calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    calPeriod: { marginTop: 2, fontWeight: FontWeight.semibold },
    calNote: { marginTop: Spacing.xs, lineHeight: 18 },
    // Modal
    overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    overlayDismiss: { flex: 1 }, // sheet üstündeki boş alan — dokununca klavye/modal kapanır
    sheet: {
        backgroundColor: Colors.backgroundModal,
        borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
        padding: Spacing.xl, maxHeight: '85%',
        borderWidth: 1, borderColor: Colors.border,
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    houseNoLg: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: Colors.goldA12, borderWidth: 1, borderColor: Colors.borderAccent,
        alignItems: 'center', justifyContent: 'center',
    },
    sheetHeadText: { flex: 1, gap: 2 },
    sheetMeaning: { lineHeight: 22, marginBottom: Spacing.lg },
    insightCard: { marginBottom: Spacing.md },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
    insightDate: { marginLeft: 'auto' },
    insightText: { lineHeight: 22 },
    skelGap: { marginTop: Spacing.sm },
    qLabel: { marginBottom: Spacing.sm },
    qInput: {
        backgroundColor: Colors.surface1, borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.border,
        color: Colors.textPrimary, fontSize: 15, padding: Spacing.md,
        minHeight: 64, textAlignVertical: 'top', marginBottom: Spacing.md,
    },
});
