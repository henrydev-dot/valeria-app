import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, Image } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path, Image as SvgImage } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, SectionHeader } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useContentStore } from '../../src/stores/useContentStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { fillTemplate, pickRandom } from '../../src/utils/templateEngine';

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 60;
const CENTER = CHART_SIZE / 2;
const R_OUTER = CHART_SIZE / 2 - 10;
const R_MIDDLE = R_OUTER - 32;
const R_INNER = R_MIDDLE - 25;
const R_CORE = R_INNER - 30;

// Zodiac signs with their symbols and Turkish names
const ZODIAC_SIGNS = [
    { symbol: '♈', name: 'Koc', element: 'fire' },
    { symbol: '♉', name: 'Boga', element: 'earth' },
    { symbol: '♊', name: 'Ikizler', element: 'air' },
    { symbol: '♋', name: 'Yengec', element: 'water' },
    { symbol: '♌', name: 'Aslan', element: 'fire' },
    { symbol: '♍', name: 'Basak', element: 'earth' },
    { symbol: '♎', name: 'Terazi', element: 'air' },
    { symbol: '♏', name: 'Akrep', element: 'water' },
    { symbol: '♐', name: 'Yay', element: 'fire' },
    { symbol: '♑', name: 'Oglak', element: 'earth' },
    { symbol: '♒', name: 'Kova', element: 'air' },
    { symbol: '♓', name: 'Balik', element: 'water' },
];

const ELEMENT_COLORS: Record<string, string> = {
    fire: '#F5C842',
    earth: '#34D399',
    air: '#60A5FA',
    water: '#A78BFA',
};

// Imports and Constants
import * as api from '../../src/api';

import { API_HOST } from '../../src/api';

const getZodiacImage = (sign: string) => {
    const map: Record<string, string> = {
        'Koç': 'icons8-aries-100.png', 'Koc': 'icons8-aries-100.png',
        'Boğa': 'icons8-taurus-100.png', 'Boga': 'icons8-taurus-100.png',
        'İkizler': 'icons8-gemini-100.png', 'Ikizler': 'icons8-gemini-100.png',
        'Yengeç': 'icons8-cancer-100.png', 'Yengec': 'icons8-cancer-100.png',
        'Aslan': 'icons8-leo-100.png',
        'Başak': 'icons8-virgo-100.png', 'Basak': 'icons8-virgo-100.png',
        'Terazi': 'icons8-libra-100.png',
        'Akrep': 'icons8-scorpio-100.png',
        'Yay': 'icons8-sagittarius-100.png',
        'Oğlak': 'icons8-capricorn-100.png', 'Oglak': 'icons8-capricorn-100.png',
        'Kova': 'icons8-aquarius-100.png',
        'Balık': 'icons8-pisces-100.png', 'Balik': 'icons8-pisces-100.png',
    };
    return `${API_HOST}/images/burclar/${map[sign] || 'icons8-aries-100.png'}`;
};

export default function AstrologyScreen() {
    const profile = useUserStore((s) => s.profile);
    const homeTemplates = useContentStore((s) => s.homeTemplates);
    const [chartData, setChartData] = useState<any>(null);

    React.useEffect(() => {
        const fetchChart = async () => {
            try {
                const data = await api.astrology.natalChart();
                setChartData(data);
            } catch (error) {
                console.error('Failed to load natal chart:', error);
            }
        };
        fetchChart();
    }, []);

    // Crystal and goal mappings by sun sign
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

    const kozmikOzet = homeTemplates?.kozmikOzet
        ? fillTemplate(pickRandom(homeTemplates.kozmikOzet), vars) : '';
    const ruhsalAnaliz = homeTemplates?.ruhsalAnaliz
        ? fillTemplate(pickRandom(homeTemplates.ruhsalAnaliz), vars) : '';
    const haftalikKehanet = homeTemplates?.haftalikKehanet
        ? fillTemplate(pickRandom(homeTemplates.haftalikKehanet), vars) : '';

    // Find user's sun sign index for highlighting
    const sunIndex = ZODIAC_SIGNS.findIndex(
        (z) => z.name.toLowerCase() === (profile.sunSign || '').toLowerCase()
    );

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Title */}
                <Text style={styles.pageTitle}>Astroloji</Text>
                <Text style={styles.pageSubtitle}>Natal haritaniz ve kozmik rehberlik</Text>

                {/* Natal Chart Wheel */}
                <View style={styles.chartContainer}>
                    <Svg width={CHART_SIZE} height={CHART_SIZE + 70}>
                        {/* Dashed outer decorative circle */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_OUTER + 5}
                            stroke={Colors.purple + '30'} strokeWidth={1}
                            strokeDasharray="4,4" fill="none"
                        />
                        {/* Outer circle */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_OUTER}
                            stroke={Colors.purple} strokeWidth={1.5}
                            fill="none"
                        />
                        {/* Middle circle */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_MIDDLE}
                            stroke={Colors.purple + '60'} strokeWidth={1}
                            fill="none"
                        />
                        {/* Inner circle */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_INNER}
                            stroke={Colors.purple + '50'} strokeWidth={1}
                            fill="none"
                        />
                        {/* Core circle */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_CORE}
                            stroke={Colors.purple + '30'} strokeWidth={0.5}
                            fill="none"
                        />

                        {/* Degree tick marks around outer edge */}
                        {Array.from({ length: 360 }, (_, deg) => {
                            const angle = (deg - 90) * (Math.PI / 180);
                            const isMajor = deg % 30 === 0;
                            const isMinor = deg % 10 === 0;
                            if (!isMajor && !isMinor && deg % 5 !== 0) return null;
                            const tickLen = isMajor ? 6 : isMinor ? 4 : 2;
                            const x1 = CENTER + R_OUTER * Math.cos(angle);
                            const y1 = CENTER + R_OUTER * Math.sin(angle);
                            const x2 = CENTER + (R_OUTER + tickLen) * Math.cos(angle);
                            const y2 = CENTER + (R_OUTER + tickLen) * Math.sin(angle);
                            return (
                                <Line key={`tick-${deg}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={Colors.purple + (isMajor ? '60' : '30')}
                                    strokeWidth={isMajor ? 1 : 0.5}
                                />
                            );
                        })}

                        {/* 12 house division lines from inner to outer */}
                        {ZODIAC_SIGNS.map((_, i) => {
                            const angle = (i * 30 - 90) * (Math.PI / 180);
                            const x1 = CENTER + R_INNER * Math.cos(angle);
                            const y1 = CENTER + R_INNER * Math.sin(angle);
                            const x2 = CENTER + R_OUTER * Math.cos(angle);
                            const y2 = CENTER + R_OUTER * Math.sin(angle);
                            return (
                                <Line
                                    key={`line-${i}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={Colors.purple + '50'} strokeWidth={0.5}
                                />
                            );
                        })}

                        {/* House numbers inside the inner ring */}
                        {ZODIAC_SIGNS.map((_, i) => {
                            const angle = ((i * 30) + 15 - 90) * (Math.PI / 180);
                            const r = R_INNER - 12;
                            const x = CENTER + r * Math.cos(angle);
                            const y = CENTER + r * Math.sin(angle) + 4;
                            return (
                                <SvgText key={`house-${i}`}
                                    x={x} y={y}
                                    textAnchor="middle"
                                    fontSize={8}
                                    fill={Colors.purple + '60'}
                                    fontWeight="300"
                                >
                                    {i + 1}
                                </SvgText>
                            );
                        })}

                        {/* Zodiac Sign images in the outer ring */}
                        {ZODIAC_SIGNS.map((sign, i) => {
                            const angle = ((i * 30) + 15 - 90) * (Math.PI / 180);
                            const symbolR = (R_OUTER + R_MIDDLE) / 2;
                            const size = 20;
                            const x = CENTER + symbolR * Math.cos(angle) - (size / 2);
                            const y = CENTER + symbolR * Math.sin(angle) - (size / 2);
                            const isActive = i === sunIndex;
                            return (
                                <SvgImage
                                    key={`symbol-img-${i}`}
                                    x={x} y={y}
                                    width={size} height={size}
                                    href={getZodiacImage(sign.name)}
                                    opacity={isActive ? 1 : 0.6}
                                />
                            );
                        })}

                        {/* Aspect Lines + Planets (computed together) */}
                        {(() => {
                            if (!chartData?.planets) return null;
                            const planetImages: Record<string, string> = {
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

                            // Calculate absolute position for each planet
                            const planetPositions: Record<string, { x: number; y: number; angle: number }> = {};

                            // Group by sign first for overlap spread
                            const planetsBySign: Record<string, any[]> = {};
                            chartData.planets.forEach((p: any) => {
                                const s = (p.sign || '').toLowerCase();
                                if (!s) return;
                                if (!planetsBySign[s]) planetsBySign[s] = [];
                                planetsBySign[s].push(p);
                            });

                            const svgElements: React.ReactNode[] = [];

                            // Render planets and calculate positions
                            Object.entries(planetsBySign).forEach(([signName, planetsInSign]) => {
                                const signIdx = ZODIAC_SIGNS.findIndex(z => z.name.toLowerCase() === signName);
                                if (signIdx === -1) return;

                                const signStartAngle = signIdx * 30 - 90;
                                const totalInSign = planetsInSign.length;

                                planetsInSign.forEach((planet: any, indexInSign: number) => {
                                    let exactAngle = signStartAngle + (planet.degree || 15);

                                    // Alternate radius: inner band vs middle band
                                    let radius = (indexInSign % 2 === 0) ? (R_INNER + 14) : (R_MIDDLE - 8);

                                    if (totalInSign > 1) {
                                        const spread = 18;
                                        const step = spread / totalInSign;
                                        const offsetAngle = (indexInSign * step) - (spread / 2) + (step / 2);
                                        exactAngle += offsetAngle;
                                    }

                                    const angleRad = exactAngle * (Math.PI / 180);
                                    const size = 16;
                                    const px = CENTER + radius * Math.cos(angleRad);
                                    const py = CENTER + radius * Math.sin(angleRad);

                                    // Record position for aspect lines (use R_CORE radius for inner line endpoints)
                                    const aspectR = R_CORE + 15;
                                    planetPositions[planet.name] = {
                                        x: CENTER + aspectR * Math.cos(angleRad),
                                        y: CENTER + aspectR * Math.sin(angleRad),
                                        angle: exactAngle
                                    };

                                    const imageName = planetImages[planet.name] || 'icons8-earth-symbol-100.png';
                                    svgElements.push(
                                        <SvgImage
                                            key={`planet-${signName}-${indexInSign}`}
                                            x={px - (size / 2)} y={py - (size / 2)}
                                            width={size} height={size}
                                            href={`${API_HOST}/images/gezegenler/${imageName}`}
                                            opacity={0.9}
                                        />
                                    );
                                });
                            });

                            // Aspect line colors
                            const ASPECT_COLORS: Record<string, string> = {
                                'Conjunction': Colors.accentYellow,
                                'Trine': '#60A5FA',      // blue
                                'Sextile': '#34D399',     // green
                                'Square': '#EF4444',      // red
                                'Opposition': '#F97316',   // orange
                            };
                            const ASPECT_DASH: Record<string, string> = {
                                'Conjunction': '',
                                'Trine': '',
                                'Sextile': '4,3',
                                'Square': '',
                                'Opposition': '6,3',
                            };

                            // Draw aspect lines inside the inner circle
                            const aspectElements: React.ReactNode[] = [];
                            if (chartData.aspects) {
                                chartData.aspects.forEach((aspect: any, idx: number) => {
                                    const p1 = planetPositions[aspect.planet1];
                                    const p2 = planetPositions[aspect.planet2];
                                    if (!p1 || !p2) return;

                                    const color = ASPECT_COLORS[aspect.type] || Colors.purple + '40';
                                    const dash = ASPECT_DASH[aspect.type] || '';

                                    aspectElements.push(
                                        <Line
                                            key={`aspect-${idx}`}
                                            x1={p1.x} y1={p1.y}
                                            x2={p2.x} y2={p2.y}
                                            stroke={color}
                                            strokeWidth={0.8}
                                            strokeDasharray={dash || undefined}
                                            opacity={0.5}
                                        />
                                    );
                                });
                            }

                            // Return aspect lines first (behind), then planet icons on top
                            return [...aspectElements, ...svgElements];
                        })()}

                        {/* Center area: user name */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_CORE - 5}
                            fill={Colors.backgroundDark}
                            opacity={0.9}
                        />
                        <Circle
                            cx={CENTER} cy={CENTER} r={R_CORE - 5}
                            stroke={Colors.purple + '40'} strokeWidth={0.5}
                            fill="none"
                        />
                        <SvgText
                            x={CENTER} y={CENTER - 2}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight="600"
                            fill={Colors.accentYellow}
                        >
                            {profile.name}
                        </SvgText>
                        <SvgText
                            x={CENTER} y={CENTER + 12}
                            textAnchor="middle"
                            fontSize={8}
                            fill={Colors.purpleLight}
                        >
                            Natal Haritası
                        </SvgText>

                        {/* Moon Phase at the bottom of the chart */}
                        {chartData?.moonPhase && (
                            <G>
                                <Circle cx={CENTER} cy={CHART_SIZE + 30} r={24} fill={Colors.backgroundDark} opacity={0.85} />
                                <Circle cx={CENTER} cy={CHART_SIZE + 30} r={24} stroke={Colors.purple + '50'} strokeWidth={1} fill="none" />
                                <SvgImage
                                    x={CENTER - 16} y={CHART_SIZE + 30 - 16}
                                    width={32} height={32}
                                    href={`${API_HOST}/images/ay/${chartData.moonPhase.image}`}
                                    opacity={0.9}
                                />
                                <SvgText
                                    x={CENTER} y={CHART_SIZE + 60}
                                    textAnchor="middle"
                                    fontSize={8}
                                    fill={Colors.textMuted}
                                >
                                    {chartData.moonPhase.phase}
                                </SvgText>
                            </G>
                        )}
                    </Svg>
                </View>

                {/* Placement Pills */}
                <View style={styles.placementRow}>
                    <View style={styles.placement}>
                        <Image source={{ uri: getZodiacImage(profile.sunSign) }} style={{ width: 20, height: 20, tintColor: Colors.accentYellow }} resizeMode="contain" />
                        <Text style={styles.placementLabel}>Gunes</Text>
                        <Text style={styles.placementValue}>{profile.sunSign}</Text>
                    </View>
                    <View style={styles.placementDivider} />
                    <View style={styles.placement}>
                        <Image source={{ uri: getZodiacImage(profile.moonSign) }} style={{ width: 20, height: 20, tintColor: Colors.purpleLight }} resizeMode="contain" />
                        <Text style={styles.placementLabel}>Ay</Text>
                        <Text style={styles.placementValue}>{profile.moonSign}</Text>
                    </View>
                    <View style={styles.placementDivider} />
                    <View style={styles.placement}>
                        <Image source={{ uri: getZodiacImage(profile.risingSign) }} style={{ width: 20, height: 20, tintColor: Colors.info }} resizeMode="contain" />
                        <Text style={styles.placementLabel}>Yukselen</Text>
                        <Text style={styles.placementValue}>{profile.risingSign}</Text>
                    </View>
                </View>

                {/* Ruhsal Analiz */}
                <SectionHeader title="Ruhsal Analiz" />
                <KismetCard style={styles.card}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="eye-outline" size={20} color={Colors.purpleLight} />
                    </View>
                    <Text style={styles.cardText}>{ruhsalAnaliz}</Text>
                </KismetCard>

                {/* Kozmik Ozet */}
                <SectionHeader title="Kozmik Ozet" />
                <KismetCard glow style={styles.card}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="sparkles-outline" size={20} color={Colors.accentYellow} />
                    </View>
                    <Text style={styles.cardText}>{kozmikOzet}</Text>
                </KismetCard>

                {/* Haftalik Kehanet */}
                <SectionHeader title="Haftalik Kehanet" />
                <KismetCard style={styles.card}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="calendar-outline" size={20} color={Colors.info} />
                    </View>
                    <Text style={styles.cardText}>{haftalikKehanet}</Text>
                </KismetCard>
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: FontSize.title,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    pageSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: Spacing.xl,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    placementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xxl,
    },
    placement: {
        alignItems: 'center',
        gap: 2,
    },
    placementLabel: {
        fontSize: 10,
        color: Colors.textMuted,
    },
    placementValue: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    placementDivider: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
    },
    card: {
        marginBottom: Spacing.lg,
    },
    sectionIcon: {
        marginBottom: Spacing.sm,
    },
    cardText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
});
