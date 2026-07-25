import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Screen,
    AppText,
    Button,
    Card,
    Skeleton,
    DailyTarot,
    DeityArchetype,
} from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { useContentStore } from '../../src/stores/useContentStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../../src/theme/spacing';
import { fillTemplate, pickRandom } from '../../src/utils/templateEngine';
import { calculateAll } from '../../src/utils/numerology';
import * as api from '../../src/api';
import { API_HOST } from '../../src/api';

const ZODIAC_ICONS: Record<string, string> = {
    'Koç': 'icons8-aries-100.png',
    'Boğa': 'icons8-taurus-100.png',
    'İkizler': 'icons8-gemini-100.png',
    'Yengeç': 'icons8-cancer-100.png',
    'Aslan': 'icons8-leo-100.png',
    'Başak': 'icons8-virgo-100.png',
    'Terazi': 'icons8-libra-100.png',
    'Akrep': 'icons8-scorpio-100.png',
    'Yay': 'icons8-sagittarius-100.png',
    'Oğlak': 'icons8-capricorn-100.png',
    'Kova': 'icons8-aquarius-100.png',
    'Balık': 'icons8-pisces-100.png',
};

const zodiacUri = (sign?: string) =>
    `${API_HOST}/images/burclar/${ZODIAC_ICONS[sign || ''] || 'icons8-aries-100.png'}`;

// Element → real element artwork served from the backend (/images/elementler).
const ELEMENT_IMAGE: Record<string, string> = {
    'Ateş': `${API_HOST}/images/elementler/icons8-fire-100.png`,
    'Hava': `${API_HOST}/images/elementler/icons8-air-100.png`,
    'Su': `${API_HOST}/images/elementler/icons8-water-element-100.png`,
    'Toprak': `${API_HOST}/images/elementler/icons8-europe-100.png`,
};
const elementUri = (el?: string) => ELEMENT_IMAGE[el || ''] || ELEMENT_IMAGE['Su'];

const NUMEROLOGY_DEFS = [
    { key: 'lifePath', label: 'Yaşam Yolu', color: '#F5C842' },
    { key: 'expression', label: 'Kader', color: '#A78BFA' },
    { key: 'soulUrge', label: 'Ruh Arzusu', color: '#60A5FA' },
    { key: 'personality', label: 'Kişilik', color: '#F472B6' },
] as const;

/** A section heading with an optional "Tümünü Gör" affordance. */
function SectionTitle({
    icon,
    iconColor,
    title,
    onSeeAll,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    onSeeAll?: () => void;
}) {
    return (
        <View style={styles.sectionTitleRow}>
            <Ionicons name={icon} size={18} color={iconColor} />
            <AppText variant="h3" style={styles.sectionTitleText}>
                {title}
            </AppText>
            {onSeeAll && (
                <AppText
                    variant="callout"
                    color={Colors.textAccent}
                    onPress={onSeeAll}
                    accessibilityRole="button"
                >
                    Tümünü Gör
                </AppText>
            )}
        </View>
    );
}

function NatalPill({
    label,
    value,
    children,
}: {
    label: string;
    value: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.natalItem}>
            {children}
            <AppText variant="label" color={Colors.textMuted} style={styles.natalLabel}>
                {label}
            </AppText>
            <AppText variant="caption" color={Colors.textPrimary} style={styles.natalValue}>
                {value || '—'}
            </AppText>
        </View>
    );
}

function StatPill({
    icon,
    color,
    label,
    value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    label: string;
    value: string | number;
}) {
    return (
        <View style={[styles.statPill, { borderColor: color + '44', backgroundColor: color + '14' }]}>
            <Ionicons name={icon} size={14} color={color} />
            <AppText variant="bodyStrong" color={Colors.textPrimary} style={styles.statValue}>
                {value}
            </AppText>
            <AppText variant="caption" color={Colors.textMuted}>
                {label}
            </AppText>
        </View>
    );
}

export default function HomeScreen() {
    const profile = useUserStore((s) => s.profile);
    const loadProfile = useUserStore((s) => s.loadProfile);
    const credits = useEntitlementsStore((s) => s.credits);
    const dailyQuestionsRemaining = useEntitlementsStore((s) => s.dailyQuestionsRemaining);
    const streakDays = useEntitlementsStore((s) => s.streakDays);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const homeTemplates = useContentStore((s) => s.homeTemplates);
    const loadContent = useContentStore((s) => s.loadAll);

    const [analysisData, setAnalysisData] = useState<any>(null);
    const [analysisLoading, setAnalysisLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const firstName = (profile.name || '').trim().split(' ')[0] || 'Yolcu';
    const numbers = calculateAll(profile.name || '', profile.birthDate || '');

    const vars = {
        name: profile.name,
        sunSign: profile.sunSign,
        deity: profile.deityName,
        gender: profile.gender,
        relationship: profile.relationshipStatus,
        work: profile.workStatus,
    };

    const dailySummaryFallback = homeTemplates?.ruhsalAnaliz
        ? fillTemplate(pickRandom(homeTemplates.ruhsalAnaliz), vars)
        : '';

    const loadAnalysis = useCallback(async () => {
        setAnalysisLoading(true);
        try {
            const data = await api.astrology.fullAnalysis();
            setAnalysisData(data);
        } catch {
            setAnalysisData(null);
        } finally {
            setAnalysisLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalysis();
    }, [loadAnalysis]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refreshEnt(), loadProfile(), loadContent(), loadAnalysis()]);
        } finally {
            setRefreshing(false);
        }
    }, [refreshEnt, loadProfile, loadContent, loadAnalysis]);

    const dailySummary = analysisData?.prediction || analysisData?.personalitySummary || dailySummaryFallback;
    const houseCount = analysisData?.houses?.length ?? 0;
    const retroCount = analysisData?.retrogradePlanets?.length ?? 0;

    const goAstrology = () => router.push('/(tabs)/astrology');

    return (
        <Screen edges={['top']} refreshing={refreshing} onRefresh={onRefresh}>
            {/* Greeting */}
            <View style={styles.greetingBlock}>
                <AppText variant="title">Merhaba, {firstName} ✨</AppText>
                <AppText variant="body" color={Colors.textSecondary} style={styles.greetingSub}>
                    Yıldızlar bugün senin için ne fısıldıyor?
                </AppText>
            </View>

            {/* Credits + streak pills */}
            <View style={styles.statRow}>
                <StatPill icon="wallet" color={Colors.accentYellow} label="Kredi" value={credits} />
                <StatPill
                    icon="chatbubble-ellipses"
                    color={Colors.purpleLight}
                    label="Soru"
                    value={`${dailyQuestionsRemaining}/3`}
                />
                <StatPill icon="flame" color={Colors.warning} label="Gün" value={streakDays} />
            </View>

            {/* Natal identity */}
            <Card style={styles.section} padded={false}>
                <View style={styles.natalStrip}>
                    <NatalPill label="Güneş" value={profile.sunSign}>
                        <Image source={{ uri: zodiacUri(profile.sunSign) }} style={styles.natalIcon} resizeMode="contain" />
                    </NatalPill>
                    <View style={styles.natalDivider} />
                    <NatalPill label="Ay" value={profile.moonSign}>
                        <Image source={{ uri: zodiacUri(profile.moonSign) }} style={styles.natalIcon} resizeMode="contain" />
                    </NatalPill>
                    <View style={styles.natalDivider} />
                    <NatalPill label="Yükselen" value={profile.risingSign}>
                        <Image source={{ uri: zodiacUri(profile.risingSign) }} style={styles.natalIcon} resizeMode="contain" />
                    </NatalPill>
                    <View style={styles.natalDivider} />
                    <NatalPill label="Element" value={profile.element || ''}>
                        <Image source={{ uri: elementUri(profile.element) }} style={styles.natalIcon} resizeMode="contain" />
                    </NatalPill>
                </View>
            </Card>

            {/* 1 — Günün Özeti */}
            <View style={styles.section}>
                <SectionTitle
                    icon="sunny"
                    iconColor={Colors.accentYellow}
                    title="Günün Özeti"
                    onSeeAll={goAstrology}
                />
                <Card glow>
                    {analysisLoading && !dailySummary ? (
                        <View style={styles.skeletonBlock}>
                            <Skeleton height={14} />
                            <Skeleton height={14} width="92%" />
                            <Skeleton height={14} width="78%" />
                        </View>
                    ) : (
                        <AppText variant="body" style={styles.summaryText}>
                            {dailySummary || 'Bugünkü rehberliğin hazırlanıyor. Biraz sonra tekrar bak.'}
                        </AppText>
                    )}
                </Card>
            </View>

            {/* 2 — Yıldızlara Sor (Horary) — öne çıkan kart */}
            <View style={styles.section}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/ask-question')}
                    accessibilityRole="button"
                    accessibilityLabel="Yıldızlara Sor: doğum haritana göre tek soruna yanıt al"
                >
                    <LinearGradient
                        colors={['#4C1D95', '#7C3AED', '#2D1B69']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.horaryCard}
                    >
                        <View style={styles.horaryBadge}>
                            <Ionicons name="telescope-outline" size={12} color={Colors.accentYellow} />
                            <AppText variant="label" color={Colors.accentYellow} style={styles.horaryBadgeText}>
                                HORARY ASTROLOJİ
                            </AppText>
                        </View>
                        <AppText variant="h1" style={styles.horaryTitle}>Yıldızlara Sor</AppText>
                        <AppText variant="body" color={Colors.textSecondary} style={styles.horaryDesc}>
                            Aklındaki TEK soruyu yaz; Valeria doğum haritanı, evlerini ve günün
                            gökyüzünü okuyarak net bir yanıt versin.
                        </AppText>
                        <View style={styles.horaryChips}>
                            {[profile.sunSign, profile.risingSign, profile.element]
                                .filter(Boolean)
                                .map((t) => (
                                    <View key={t} style={styles.horaryChip}>
                                        <AppText variant="caption" color={Colors.textPrimary}>{t}</AppText>
                                    </View>
                                ))}
                        </View>
                        <View style={styles.horaryFooter}>
                            <View style={styles.horaryFree}>
                                <Ionicons
                                    name={dailyQuestionsRemaining > 0 ? 'gift' : 'diamond'}
                                    size={13}
                                    color={dailyQuestionsRemaining > 0 ? Colors.success : Colors.accentYellow}
                                />
                                <AppText
                                    variant="caption"
                                    color={dailyQuestionsRemaining > 0 ? Colors.success : Colors.accentYellow}
                                >
                                    {dailyQuestionsRemaining > 0
                                        ? `${dailyQuestionsRemaining} ücretsiz soru hakkın var`
                                        : 'Kredi ile sorabilirsin'}
                                </AppText>
                            </View>
                            <View style={styles.horaryCta}>
                                <AppText variant="callout" color={Colors.textOnAccent} style={styles.horaryCtaText}>
                                    Soru Sor
                                </AppText>
                                <Ionicons name="arrow-forward" size={15} color={Colors.textOnAccent} />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* 3 — Günlük Tarot */}
            <View style={styles.section}>
                <SectionTitle
                    icon="layers"
                    iconColor={Colors.accentYellow}
                    title="Günlük Tarot"
                    onSeeAll={() => router.push('/tarot-reading')}
                />
                <DailyTarot />
            </View>

            {/* 4 — Numeroloji */}
            <View style={styles.section}>
                <SectionTitle
                    icon="calculator"
                    iconColor={Colors.info}
                    title="Numeroloji"
                    onSeeAll={() => router.push('/numerology')}
                />
                <Card
                    onPress={() => router.push('/numerology')}
                    accessibilityLabel="Numeroloji haritanı aç"
                >
                    <View style={styles.numRow}>
                        {NUMEROLOGY_DEFS.map((d) => (
                            <View key={d.key} style={styles.numItem}>
                                <View style={[styles.numCircle, { borderColor: d.color }]}>
                                    <AppText variant="h2" color={d.color}>{numbers[d.key]}</AppText>
                                </View>
                                <AppText variant="label" color={Colors.textMuted} style={styles.numLabel}>
                                    {d.label}
                                </AppText>
                            </View>
                        ))}
                    </View>
                    <View style={styles.numFooter}>
                        <Ionicons name="sparkles-outline" size={14} color={Colors.accentYellow} />
                        <AppText variant="caption" color={Colors.textSecondary} style={styles.numFooterText}>
                            İsmin ve doğum tarihinden hesaplandı — anlamlarını keşfet
                        </AppText>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </View>
                </Card>
            </View>

            {/* 5 — Tanrı Arketipin */}
            <View style={styles.section}>
                <SectionTitle icon="sparkles" iconColor={Colors.purpleLight} title="Tanrı Arketipin" />
                <DeityArchetype />
            </View>

            {/* 6 — Ay Döngüsü */}
            {profile.currentMoon && (
                <View style={styles.section}>
                    <SectionTitle icon="moon" iconColor={Colors.info} title="Ay Döngüsü" />
                    <Card>
                        <View style={styles.moonRow}>
                            <Image
                                source={{ uri: `${API_HOST}/images/ay/${profile.currentMoon.image}` }}
                                style={styles.moonIcon}
                                resizeMode="contain"
                            />
                            <View style={styles.moonInfo}>
                                <AppText variant="h3" color={Colors.purpleLight}>
                                    {profile.currentMoon.phase}
                                </AppText>
                                <AppText variant="caption" color={Colors.textMuted}>
                                    Aydınlanma: %{profile.currentMoon.illumination}
                                </AppText>
                            </View>
                        </View>
                    </Card>
                </View>
            )}

            {/* 7 — Detaylı Astroloji */}
            <View style={styles.section}>
                <Card onPress={goAstrology} accessibilityLabel="Detaylı astroloji analizini aç">
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="planet" size={22} color={Colors.accentYellow} />
                        </View>
                        <View style={styles.detailInfo}>
                            <AppText variant="h3">Detaylı Astroloji</AppText>
                            <AppText variant="caption" color={Colors.textMuted}>
                                Natal harita, evler, gezegenler ve retrolar
                            </AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    </View>
                    {analysisLoading ? (
                        <View style={styles.detailStats}>
                            <Skeleton height={12} width={90} />
                            <Skeleton height={12} width={90} />
                        </View>
                    ) : (
                        (houseCount > 0 || retroCount > 0) && (
                            <View style={styles.detailStats}>
                                <AppText variant="caption" color={Colors.textSecondary}>
                                    {houseCount} ev haritası
                                </AppText>
                                <AppText variant="caption" color={Colors.textSecondary}>
                                    {retroCount} retro gezegen
                                </AppText>
                            </View>
                        )
                    )}
                </Card>
            </View>

            {/* Quick actions */}
            <View style={[styles.section, styles.quickRow]}>
                <TouchableOpacity
                    style={styles.quickCard}
                    activeOpacity={0.85}
                    onPress={() => router.push('/tarot-reading')}
                    accessibilityRole="button"
                    accessibilityLabel="Tarot kartı çek"
                >
                    <LinearGradient
                        colors={['#3B2A7A', '#1A1145']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickInner}
                    >
                        <Ionicons name="albums-outline" size={24} color={Colors.accentYellow} />
                        <AppText variant="callout" color={Colors.textPrimary} center>
                            Tarot Kartı Çek
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickCard}
                    activeOpacity={0.85}
                    onPress={() => router.push('/coffee-reading')}
                    accessibilityRole="button"
                    accessibilityLabel="Fal baktır"
                >
                    <LinearGradient
                        colors={['#4A2545', '#1A1145']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickInner}
                    >
                        <Ionicons name="cafe-outline" size={24} color={'#F472B6'} />
                        <AppText variant="callout" color={Colors.textPrimary} center>
                            Fal Baktır
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    greetingBlock: {
        marginBottom: Spacing.lg,
    },
    greetingSub: {
        marginTop: Spacing.xs,
    },
    statRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    statPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        borderRadius: BorderRadius.pill,
        borderWidth: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    statValue: {
        marginLeft: 2,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    sectionTitleText: {
        flex: 1,
    },
    // Natal strip
    natalStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    natalItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    natalIcon: {
        width: 30,
        height: 30,
    },
    natalLabel: {
        marginTop: 2,
    },
    natalValue: {
        fontWeight: FontWeight.semibold,
    },
    natalDivider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.border,
    },
    // Günün Özeti
    skeletonBlock: {
        gap: Spacing.sm,
    },
    summaryText: {
        lineHeight: 24,
    },
    // Horary kartı
    horaryCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.purpleA25,
    },
    horaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(10, 10, 26, 0.45)',
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        marginBottom: Spacing.md,
    },
    horaryBadgeText: {
        letterSpacing: 1.2,
    },
    horaryTitle: {
        marginBottom: Spacing.xs,
    },
    horaryDesc: {
        lineHeight: 21,
        marginBottom: Spacing.md,
    },
    horaryChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    horaryChip: {
        backgroundColor: Colors.whiteA12,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 3,
    },
    horaryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    horaryFree: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    horaryCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.accentYellow,
        borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    horaryCtaText: {
        fontWeight: FontWeight.bold,
    },
    // Numeroloji
    numRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numItem: {
        alignItems: 'center',
        flex: 1,
    },
    numCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface2,
    },
    numLabel: {
        marginTop: Spacing.sm,
        letterSpacing: 0.4,
    },
    numFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    numFooterText: {
        flex: 1,
    },
    // Ay Döngüsü
    moonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    moonIcon: {
        width: 56,
        height: 56,
    },
    moonInfo: {
        flex: 1,
        gap: 2,
    },
    // Detaylı Astroloji
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    detailIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.goldA12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailInfo: {
        flex: 1,
        gap: 2,
    },
    detailStats: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    // Quick actions
    quickRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    quickCard: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    quickInner: {
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
