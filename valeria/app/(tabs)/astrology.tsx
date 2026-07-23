import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Image, Dimensions, Modal, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Image as SvgImage } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import {
    Screen, AppText, Button, Card, EmptyState, LoadingView, Skeleton,
} from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useContentStore } from '../../src/stores/useContentStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../../src/theme/spacing';
import { fillTemplate, pickRandom } from '../../src/utils/templateEngine';
import * as api from '../../src/api';
import { API_HOST } from '../../src/api';

// ─── Geometry (clamped so nothing clips on small screens) ───────────
const { width } = Dimensions.get('window');
const CHART_SIZE = Math.max(260, Math.min(width - 48, 340));
const CENTER = CHART_SIZE / 2;
const R_OUTER = CHART_SIZE / 2 - 16;   // leaves room for degree ticks
const R_MIDDLE = R_OUTER - 40;
const R_INNER = R_MIDDLE - 34;
const R_CORE = R_INNER - 32;
const MOON_CY = CHART_SIZE + 34;

// ─── Zodiac data ────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
    { symbol: '♈', name: 'Koç', element: 'fire' },
    { symbol: '♉', name: 'Boğa', element: 'earth' },
    { symbol: '♊', name: 'İkizler', element: 'air' },
    { symbol: '♋', name: 'Yengeç', element: 'water' },
    { symbol: '♌', name: 'Aslan', element: 'fire' },
    { symbol: '♍', name: 'Başak', element: 'earth' },
    { symbol: '♎', name: 'Terazi', element: 'air' },
    { symbol: '♏', name: 'Akrep', element: 'water' },
    { symbol: '♐', name: 'Yay', element: 'fire' },
    { symbol: '♑', name: 'Oğlak', element: 'earth' },
    { symbol: '♒', name: 'Kova', element: 'air' },
    { symbol: '♓', name: 'Balık', element: 'water' },
];

// Normalise Turkish letters for tolerant matching (Koç -> koc)
const normalize = (s: string) =>
    (s || '')
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i').replace(/ç/g, 'c').replace(/ğ/g, 'g')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');

const ZODIAC_IMAGE_FILES: Record<string, string> = {
    koc: 'icons8-aries-100.png', boga: 'icons8-taurus-100.png',
    ikizler: 'icons8-gemini-100.png', yengec: 'icons8-cancer-100.png',
    aslan: 'icons8-leo-100.png', basak: 'icons8-virgo-100.png',
    terazi: 'icons8-libra-100.png', akrep: 'icons8-scorpio-100.png',
    yay: 'icons8-sagittarius-100.png', oglak: 'icons8-capricorn-100.png',
    kova: 'icons8-aquarius-100.png', balik: 'icons8-pisces-100.png',
};
const getZodiacImage = (sign?: string) =>
    `${API_HOST}/images/burclar/${ZODIAC_IMAGE_FILES[normalize(sign || '')] || 'icons8-aries-100.png'}`;

const PLANET_IMAGE_FILES: Record<string, string> = {
    'Güneş': 'icons8-sun-symbol-100.png',
    'Ay': 'icons8-moon-symbol-100.png',
    'Merkür': 'icons8-mercury-100.png',
    'Venüs': 'icons8-venus-symbol-100.png',
    'Mars': 'icons8-mars-symbol-100.png',
    'Jüpiter': 'icons8-jupiter-symbol-100.png',
    'Satürn': 'icons8-saturn-symbol-100.png',
    'Uranüs': 'icons8-uranus-symbol-100.png',
    'Neptün': 'icons8-neptune-symbol-100.png',
    'Plüton': 'icons8-pluto-100.png',
};
const getPlanetImage = (name: string) =>
    `${API_HOST}/images/gezegenler/${PLANET_IMAGE_FILES[name] || 'icons8-earth-symbol-100.png'}`;

// ─── Static Turkish meanings (info sheet) ───────────────────────────
const PLANET_MEANINGS: Record<string, string> = {
    'Güneş': 'Temel kimliğin, öz benliğin ve yaşam enerjin. Ne olmak için doğduğunu anlatır.',
    'Ay': 'Duygusal dünyan, iç sesin ve güvenlik ihtiyacın. Sana huzur veren şeyleri gösterir.',
    'Yükselen': 'Dış dünyaya yansıttığın ilk izlenim ve maskin. İnsanların seni ilk nasıl gördüğü.',
    'Merkür': 'Düşünme, iletişim ve öğrenme biçimin. Fikirlerini nasıl ifade ettiğin.',
    'Venüs': 'Sevgi, güzellik ve ilişki anlayışın. Nelerden ve kimlerden hoşlandığın.',
    'Mars': 'Enerjin, tutkun ve harekete geçme gücün. Nasıl mücadele ettiğin.',
    'Jüpiter': 'Şans, büyüme ve genişleme alanların. Hayatın sana nerede bolluk sunduğu.',
    'Satürn': 'Disiplin, sorumluluk ve sınırların. Olgunlaşmak için çalışman gereken alan.',
    'Uranüs': 'Özgünlük, ani değişim ve isyankâr yanların. Kalıpları kırdığın yer.',
    'Neptün': 'Hayal gücün, sezgin ve ruhsallığın. Rüyaların ve ilhamların kaynağı.',
    'Plüton': 'Dönüşüm, güç ve derin değişim. Yeniden doğduğun, kabuk değiştirdiğin alan.',
};

// ─── Aspect styling + legend ────────────────────────────────────────
const ASPECT_STYLE: Record<string, { color: string; dash?: string; label: string }> = {
    Conjunction: { color: Colors.accentYellow, label: 'Kavuşum' },
    Trine: { color: Colors.info, label: 'Üçgen' },
    Sextile: { color: Colors.success, dash: '5,3', label: 'Altmışlık' },
    Square: { color: Colors.error, label: 'Kare' },
    Opposition: { color: Colors.warning, dash: '7,3', label: 'Karşıt' },
};

const ELEMENT_COLORS: Record<string, string> = {
    fire: Colors.accentYellow,
    earth: Colors.success,
    air: Colors.info,
    water: Colors.purpleLight,
};

const SIGN_CRYSTALS: Record<string, string> = {
    'Koç': 'Kırmızı Jasper ve Karneol', 'Boğa': 'Gül Kuvars ve Zümrüt',
    'İkizler': 'Akuamarin ve Sitrin', 'Yengeç': 'Ay Taşı ve İnci',
    'Aslan': 'Kaplan Gözü ve Kehribar', 'Başak': 'Ametist ve Peridot',
    'Terazi': 'Lapis Lazuli ve Opal', 'Akrep': 'Obsidyen ve Granat',
    'Yay': 'Turkuaz ve Topaz', 'Oğlak': 'Oniks ve Garnet',
    'Kova': 'Ametist ve Akuamarin', 'Balık': 'Ay Taşı ve Ametist',
};
const SIGN_GOALS: Record<string, string> = {
    'Koç': 'kariyer ve liderlik', 'Boğa': 'finansal güvenlik ve ilişki',
    'İkizler': 'iletişim ve öğrenme', 'Yengeç': 'aile ve duygusal denge',
    'Aslan': 'yaratıcılık ve tanınırlık', 'Başak': 'sağlık ve düzen',
    'Terazi': 'ilişkiler ve uyum', 'Akrep': 'dönüşüm ve derinlik',
    'Yay': 'keşif ve özgürlük', 'Oğlak': 'kariyer ve yapı',
    'Kova': 'yenilik ve topluluk', 'Balık': 'ruhsallık ve yaratıcılık',
};

interface SelectedPlacement {
    title: string;
    subtitle?: string;
    body: string;
}

export default function AstrologyScreen() {
    const profile = useUserStore((s) => s.profile);
    const homeTemplates = useContentStore((s) => s.homeTemplates);

    const [chartData, setChartData] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [refreshing, setRefreshing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [selected, setSelected] = useState<SelectedPlacement | null>(null);

    const loadChart = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setStatus('loading');
        try {
            const data = await api.astrology.natalChart();
            setChartData(data);
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, []);

    // Personalised AI text is best-effort; template text is the fallback.
    const loadAnalysis = useCallback(async () => {
        setAnalysisLoading(true);
        try {
            const data = await api.astrology.fullAnalysis();
            setAnalysis(data);
        } catch {
            setAnalysis(null);
        } finally {
            setAnalysisLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChart();
        loadAnalysis();
    }, [loadChart, loadAnalysis]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadChart(true), loadAnalysis()]);
        setRefreshing(false);
    }, [loadChart, loadAnalysis]);

    // ─── Template fallback text ─────────────────────────────────────
    const templates = useMemo(() => {
        const vars = {
            name: profile.name,
            sunSign: profile.sunSign,
            deity: profile.deityName,
            gender: profile.gender,
            relationship: profile.relationshipStatus,
            work: profile.workStatus,
            crystals: SIGN_CRYSTALS[profile.sunSign] || 'Ametist ve Kuvars',
            goals: SIGN_GOALS[profile.sunSign] || 'kişisel gelişim ve kariyer',
        };
        return {
            kozmikOzet: homeTemplates?.kozmikOzet
                ? fillTemplate(pickRandom(homeTemplates.kozmikOzet), vars) : '',
            ruhsalAnaliz: homeTemplates?.ruhsalAnaliz
                ? fillTemplate(pickRandom(homeTemplates.ruhsalAnaliz), vars) : '',
            haftalikKehanet: homeTemplates?.haftalikKehanet
                ? fillTemplate(pickRandom(homeTemplates.haftalikKehanet), vars) : '',
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [homeTemplates, profile.name, profile.sunSign, profile.deityName]);

    // Coerce API values to a display string. loveAnalysis comes back as an
    // object ({ mistakes, idealPartner, attractionDynamics }); flatten it.
    const asText = (v: unknown): string | undefined => {
        if (typeof v === 'string') return v.trim() || undefined;
        if (v && typeof v === 'object') {
            const o = v as Record<string, unknown>;
            const parts = [o.idealPartner, o.attractionDynamics, o.mistakes]
                .filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
            return parts.length ? parts.join('\n\n') : undefined;
        }
        return undefined;
    };

    const sections = useMemo(() => ([
        {
            key: 'ozet',
            title: 'Kozmik Özet',
            icon: 'sparkles-outline' as const,
            iconColor: Colors.accentYellow,
            glow: true,
            ai: asText(analysis?.personalitySummary),
            fallback: templates.kozmikOzet,
        },
        {
            key: 'ruhsal',
            title: 'İlişki & Ruh Analizi',
            icon: 'heart-outline' as const,
            iconColor: Colors.purpleLight,
            glow: false,
            ai: asText(analysis?.loveAnalysis),
            fallback: templates.ruhsalAnaliz,
        },
        {
            key: 'kehanet',
            title: 'Haftalık Kehanet',
            icon: 'calendar-outline' as const,
            iconColor: Colors.info,
            glow: false,
            ai: asText(analysis?.prediction),
            fallback: templates.haftalikKehanet,
        },
    ]), [analysis, templates]);

    const sunIndex = ZODIAC_SIGNS.findIndex((z) => normalize(z.name) === normalize(profile.sunSign));

    const openLuminary = (label: string, sign: string, key: 'Güneş' | 'Ay' | 'Yükselen') => {
        setSelected({
            title: `${label}${sign ? ` — ${sign}` : ''}`,
            subtitle: sign ? `${sign} burcunda` : undefined,
            body: PLANET_MEANINGS[key],
        });
    };

    const openPlanet = (planet: any) => {
        const parts: string[] = [];
        if (planet.sign) parts.push(`${planet.sign} burcunda`);
        if (planet.house) parts.push(`${planet.house}. evde`);
        setSelected({
            title: planet.name,
            subtitle: parts.join(' · ') || undefined,
            body: PLANET_MEANINGS[planet.name] || 'Bu gezegen doğum haritanda önemli bir enerjiyi temsil eder.',
        });
    };

    // ─── Loading / error states ─────────────────────────────────────
    if (status === 'loading') {
        return (
            <Screen edges={['top']}>
                <AppText variant="title" center>Astroloji</AppText>
                <AppText variant="caption" center style={styles.subtitle}>
                    Natal haritanız hazırlanıyor
                </AppText>
                <View style={styles.chartSkeleton}>
                    <Skeleton width={CHART_SIZE} height={CHART_SIZE} radius={CHART_SIZE / 2} />
                </View>
                <Skeleton height={64} radius={BorderRadius.lg} style={styles.blockGap} />
                <Skeleton height={120} radius={BorderRadius.xl} style={styles.blockGap} />
                <Skeleton height={120} radius={BorderRadius.xl} style={styles.blockGap} />
                <LoadingView text="Yıldızlar hizalanıyor..." />
            </Screen>
        );
    }

    if (status === 'error') {
        return (
            <Screen edges={['top']}>
                <AppText variant="title" center>Astroloji</AppText>
                <EmptyState
                    icon={<Ionicons name="planet-outline" size={56} color={Colors.purpleLight} />}
                    title="Harita yüklenemedi"
                    message="Natal haritanı getiremedik. Bağlantını kontrol edip tekrar dene."
                    actionLabel="Tekrar Dene"
                    onAction={() => loadChart()}
                />
            </Screen>
        );
    }

    const hasAspects = Array.isArray(chartData?.aspects) && chartData.aspects.length > 0;

    return (
        <Screen edges={['top']} refreshing={refreshing} onRefresh={onRefresh}>
            <AppText variant="title" center>Astroloji</AppText>
            <AppText variant="caption" center style={styles.subtitle}>
                Natal haritanız ve kozmik rehberlik
            </AppText>

            {/* Natal Chart Wheel */}
            <View style={styles.chartContainer}>
                <Svg width={CHART_SIZE} height={MOON_CY + 40}>
                    {/* Concentric rings */}
                    <Circle cx={CENTER} cy={CENTER} r={R_OUTER + 6} stroke={Colors.purple + '30'} strokeWidth={1} strokeDasharray="4,4" fill="none" />
                    <Circle cx={CENTER} cy={CENTER} r={R_OUTER} stroke={Colors.purple} strokeWidth={1.5} fill="none" />
                    <Circle cx={CENTER} cy={CENTER} r={R_MIDDLE} stroke={Colors.purple + '60'} strokeWidth={1} fill="none" />
                    <Circle cx={CENTER} cy={CENTER} r={R_INNER} stroke={Colors.purple + '50'} strokeWidth={1} fill="none" />
                    <Circle cx={CENTER} cy={CENTER} r={R_CORE} stroke={Colors.purple + '30'} strokeWidth={0.5} fill="none" />

                    {/* Degree ticks */}
                    {Array.from({ length: 72 }, (_, i) => {
                        const deg = i * 5;
                        const angle = (deg - 90) * (Math.PI / 180);
                        const isMajor = deg % 30 === 0;
                        const isMid = deg % 10 === 0;
                        const tickLen = isMajor ? 7 : isMid ? 4 : 2;
                        const x1 = CENTER + R_OUTER * Math.cos(angle);
                        const y1 = CENTER + R_OUTER * Math.sin(angle);
                        const x2 = CENTER + (R_OUTER + tickLen) * Math.cos(angle);
                        const y2 = CENTER + (R_OUTER + tickLen) * Math.sin(angle);
                        return (
                            <Line key={`tick-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={Colors.purple + (isMajor ? '70' : '35')} strokeWidth={isMajor ? 1 : 0.5} />
                        );
                    })}

                    {/* House division lines */}
                    {ZODIAC_SIGNS.map((_, i) => {
                        const angle = (i * 30 - 90) * (Math.PI / 180);
                        return (
                            <Line key={`div-${i}`}
                                x1={CENTER + R_INNER * Math.cos(angle)} y1={CENTER + R_INNER * Math.sin(angle)}
                                x2={CENTER + R_OUTER * Math.cos(angle)} y2={CENTER + R_OUTER * Math.sin(angle)}
                                stroke={Colors.purple + '50'} strokeWidth={0.75} />
                        );
                    })}

                    {/* House numbers */}
                    {ZODIAC_SIGNS.map((_, i) => {
                        const angle = ((i * 30) + 15 - 90) * (Math.PI / 180);
                        const r = R_INNER - 15;
                        return (
                            <SvgText key={`house-${i}`}
                                x={CENTER + r * Math.cos(angle)} y={CENTER + r * Math.sin(angle) + 5}
                                textAnchor="middle" fontSize={13} fill={Colors.purpleLight} fontWeight="600">
                                {i + 1}
                            </SvgText>
                        );
                    })}

                    {/* Zodiac sign icons (natural color, no tint) */}
                    {ZODIAC_SIGNS.map((sign, i) => {
                        const angle = ((i * 30) + 15 - 90) * (Math.PI / 180);
                        const symbolR = (R_OUTER + R_MIDDLE) / 2;
                        const size = 26;
                        const isActive = i === sunIndex;
                        return (
                            <SvgImage key={`sign-${i}`}
                                x={CENTER + symbolR * Math.cos(angle) - size / 2}
                                y={CENTER + symbolR * Math.sin(angle) - size / 2}
                                width={size} height={size}
                                href={getZodiacImage(sign.name)}
                                opacity={isActive ? 1 : 0.65} />
                        );
                    })}

                    {/* Aspect lines + planets */}
                    {(() => {
                        if (!chartData?.planets) return null;
                        const positions: Record<string, { x: number; y: number }> = {};
                        const bySign: Record<string, any[]> = {};
                        chartData.planets.forEach((p: any) => {
                            const s = normalize(p.sign);
                            if (!s) return;
                            (bySign[s] = bySign[s] || []).push(p);
                        });

                        const planetNodes: React.ReactNode[] = [];
                        Object.entries(bySign).forEach(([signName, group]) => {
                            const signIdx = ZODIAC_SIGNS.findIndex((z) => normalize(z.name) === signName);
                            if (signIdx === -1) return;
                            const signStart = signIdx * 30 - 90;
                            group.forEach((planet: any, idx: number) => {
                                let exact = signStart + (planet.degree || 15);
                                const radius = idx % 2 === 0 ? R_INNER + 14 : R_MIDDLE - 14;
                                if (group.length > 1) {
                                    const spread = 18;
                                    const step = spread / group.length;
                                    exact += idx * step - spread / 2 + step / 2;
                                }
                                const rad = exact * (Math.PI / 180);
                                const size = 24;
                                const px = CENTER + radius * Math.cos(rad);
                                const py = CENTER + radius * Math.sin(rad);
                                const aspectR = R_CORE + 12;
                                positions[planet.name] = {
                                    x: CENTER + aspectR * Math.cos(rad),
                                    y: CENTER + aspectR * Math.sin(rad),
                                };
                                planetNodes.push(
                                    <G key={`planet-${signName}-${idx}`} onPress={() => openPlanet(planet)}>
                                        {/* larger transparent hit area */}
                                        <Circle cx={px} cy={py} r={18} fill={Colors.backgroundDark} opacity={0.01} />
                                        <SvgImage
                                            x={px - size / 2} y={py - size / 2}
                                            width={size} height={size}
                                            href={getPlanetImage(planet.name)} opacity={1} />
                                    </G>
                                );
                            });
                        });

                        const aspectNodes: React.ReactNode[] = [];
                        if (Array.isArray(chartData.aspects)) {
                            chartData.aspects.forEach((aspect: any, idx: number) => {
                                const p1 = positions[aspect.planet1];
                                const p2 = positions[aspect.planet2];
                                if (!p1 || !p2) return;
                                const style = ASPECT_STYLE[aspect.type];
                                aspectNodes.push(
                                    <Line key={`aspect-${idx}`}
                                        x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                        stroke={style?.color || Colors.purpleLight}
                                        strokeWidth={1.5}
                                        strokeDasharray={style?.dash}
                                        opacity={0.75} />
                                );
                            });
                        }
                        return [...aspectNodes, ...planetNodes];
                    })()}

                    {/* Center */}
                    <Circle cx={CENTER} cy={CENTER} r={R_CORE - 4} fill={Colors.backgroundDark} opacity={0.92} />
                    <Circle cx={CENTER} cy={CENTER} r={R_CORE - 4} stroke={Colors.purple + '40'} strokeWidth={0.5} fill="none" />
                    <SvgText x={CENTER} y={CENTER - 2} textAnchor="middle" fontSize={15} fontWeight="700" fill={Colors.accentYellow}>
                        {profile.name}
                    </SvgText>
                    <SvgText x={CENTER} y={CENTER + 15} textAnchor="middle" fontSize={11} fill={Colors.purpleLight}>
                        Natal Haritası
                    </SvgText>

                    {/* Moon phase */}
                    {chartData?.moonPhase && (
                        <G>
                            <Circle cx={CENTER} cy={MOON_CY} r={26} fill={Colors.backgroundDark} opacity={0.85} />
                            <Circle cx={CENTER} cy={MOON_CY} r={26} stroke={Colors.purple + '50'} strokeWidth={1} fill="none" />
                            <SvgImage x={CENTER - 18} y={MOON_CY - 18} width={36} height={36}
                                href={`${API_HOST}/images/ay/${chartData.moonPhase.image}`} opacity={1} />
                            <SvgText x={CENTER} y={MOON_CY + 42} textAnchor="middle" fontSize={11} fill={Colors.textSecondary}>
                                {chartData.moonPhase.phase}
                            </SvgText>
                        </G>
                    )}
                </Svg>
            </View>

            {/* Aspect legend */}
            {hasAspects && (
                <Card style={styles.legendCard} padded>
                    <AppText variant="label" style={styles.legendTitle}>Açı Çizgileri</AppText>
                    <View style={styles.legendRow}>
                        {Object.values(ASPECT_STYLE).map((a) => (
                            <View key={a.label} style={styles.legendItem}>
                                <View style={[
                                    styles.legendSwatch,
                                    { backgroundColor: a.color, opacity: a.dash ? 0.85 : 1 },
                                ]} />
                                <AppText variant="caption" color={Colors.textSecondary}>{a.label}</AppText>
                            </View>
                        ))}
                    </View>
                </Card>
            )}

            {/* Placement pills (tappable) */}
            <View style={styles.placementRow}>
                <PlacementPill
                    label="Güneş" sign={profile.sunSign} color={Colors.accentYellow}
                    onPress={() => openLuminary('Güneş', profile.sunSign, 'Güneş')} />
                <View style={styles.placementDivider} />
                <PlacementPill
                    label="Ay" sign={profile.moonSign} color={Colors.purpleLight}
                    onPress={() => openLuminary('Ay', profile.moonSign, 'Ay')} />
                <View style={styles.placementDivider} />
                <PlacementPill
                    label="Yükselen" sign={profile.risingSign} color={Colors.info}
                    onPress={() => openLuminary('Yükselen', profile.risingSign, 'Yükselen')} />
            </View>

            {/* Text sections */}
            {sections.map((section) => {
                const text = section.ai || section.fallback;
                return (
                    <View key={section.key} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name={section.icon} size={18} color={section.iconColor} />
                            <AppText variant="h2" style={styles.sectionTitle}>{section.title}</AppText>
                        </View>
                        <Card glow={section.glow}>
                            {analysisLoading && !text ? (
                                <>
                                    <Skeleton height={14} style={styles.line} />
                                    <Skeleton height={14} width="90%" style={styles.line} />
                                    <Skeleton height={14} width="75%" />
                                </>
                            ) : text ? (
                                <>
                                    <AppText variant="body">{text}</AppText>
                                    <AppText variant="caption" style={styles.sourceTag}>
                                        {section.ai ? 'Doğum haritana özel yorum' : 'Örnek yorum'}
                                    </AppText>
                                </>
                            ) : (
                                <AppText variant="body" color={Colors.textMuted}>
                                    Bu bölüm için yorum bulunamadı.
                                </AppText>
                            )}
                        </Card>
                    </View>
                );
            })}

            {/* Info sheet */}
            <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => { }} style={styles.sheetWrap}>
                        <Card glow>
                            <AppText variant="h1">{selected?.title}</AppText>
                            {selected?.subtitle ? (
                                <AppText variant="callout" color={Colors.textAccent} style={styles.sheetSub}>
                                    {selected.subtitle}
                                </AppText>
                            ) : null}
                            <AppText variant="body" style={styles.sheetBody}>{selected?.body}</AppText>
                            <Button title="Kapat" variant="secondary" size="md" onPress={() => setSelected(null)} style={styles.sheetBtn} />
                        </Card>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Screen>
    );
}

function PlacementPill({ label, sign, color, onPress }: { label: string; sign: string; color: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            style={styles.placement}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${sign || 'bilinmiyor'}. Anlamını görmek için dokun.`}
        >
            <Image source={{ uri: getZodiacImage(sign) }} style={styles.placementIcon} resizeMode="contain" />
            <AppText variant="caption" color={color} style={styles.placementLabel}>{label}</AppText>
            <AppText variant="bodyStrong">{sign || '—'}</AppText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    subtitle: { marginTop: Spacing.xs, marginBottom: Spacing.xl },
    chartContainer: { alignItems: 'center', marginBottom: Spacing.xl },
    chartSkeleton: { alignItems: 'center', marginVertical: Spacing.xl },
    blockGap: { marginBottom: Spacing.lg },
    legendCard: { marginBottom: Spacing.xl },
    legendTitle: { marginBottom: Spacing.md },
    legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minWidth: 92 },
    legendSwatch: { width: 18, height: 4, borderRadius: 2 },
    placementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xxl,
    },
    placement: { flex: 1, alignItems: 'center', gap: 4, minHeight: 64, justifyContent: 'center' },
    placementIcon: { width: 28, height: 28 },
    placementLabel: { textTransform: 'none', letterSpacing: 0, fontWeight: FontWeight.semibold },
    placementDivider: { width: 1, height: 40, backgroundColor: Colors.border },
    section: { marginBottom: Spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    sectionTitle: { flex: 1 },
    line: { marginBottom: Spacing.sm },
    sourceTag: { marginTop: Spacing.md, fontStyle: 'italic' },
    overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', paddingHorizontal: Spacing.xl },
    sheetWrap: { width: '100%' },
    sheetSub: { marginTop: Spacing.xs },
    sheetBody: { marginTop: Spacing.md },
    sheetBtn: { marginTop: Spacing.xl, alignSelf: 'flex-start' },
});
