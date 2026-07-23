import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, PillBadge, SectionHeader, DailyTarot, DeityArchetype } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { useContentStore } from '../../src/stores/useContentStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { fillTemplate, pickRandom } from '../../src/utils/templateEngine';
import { calculateAll, NumerologyResult } from '../../src/utils/numerology';
import * as api from '../../src/api';

import { API_HOST } from '../../src/api';

console.log('🖼️ HOME API_HOST:', API_HOST);
console.log('🖼️ Sample zodiac URL:', `${API_HOST}/images/burclar/icons8-aquarius-100.png`);

const getZodiacImage = (sign: string) => {
    const map: Record<string, string> = {
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
        'Balık': 'icons8-pisces-100.png'
    };
    return `${API_HOST}/images/burclar/${map[sign] || 'icons8-aries-100.png'}`;
};

const getElementImage = (element: string) => {
    const map: Record<string, string> = {
        'Ateş': 'icons8-fire-100.png',
        'Toprak': 'icons8-air-100.png', // Temporary fallback
        'Hava': 'icons8-air-100.png',
        'Su': 'icons8-water-element-100.png'
    };
    return `${API_HOST}/images/elementler/${map[element] || 'icons8-air-100.png'}`;
};

// Collapsible accordion item
function AccordionItem({
    icon,
    iconColor,
    title,
    expanded,
    onToggle,
    children,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <View style={accStyles.container}>
            <TouchableOpacity style={accStyles.header} onPress={onToggle} activeOpacity={0.7}>
                <Ionicons name={icon} size={18} color={iconColor} />
                <Text style={accStyles.title}>{title}</Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textMuted}
                />
            </TouchableOpacity>
            {expanded && <View style={accStyles.body}>{children}</View>}
        </View>
    );
}

const accStyles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    body: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
});

export default function HomeScreen() {
    const profile = useUserStore((s) => s.profile);
    const credits = useEntitlementsStore((s) => s.credits);
    const dailyQuestionsRemaining = useEntitlementsStore((s) => s.dailyQuestionsRemaining);
    const unlockedContentIds = useEntitlementsStore((s) => s.unlockedContentIds);
    const streakDays = useEntitlementsStore((s) => s.streakDays);
    const homeTemplates = useContentStore((s) => s.homeTemplates);
    const [question, setQuestion] = useState('');
    const [horaryAnswer, setHoraryAnswer] = useState<string | null>(null);
    const [horaryLoading, setHoraryLoading] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const addQuestion = useContentStore((s) => s.addQuestion);

    // Full analysis state
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [analysisLoading, setAnalysisLoading] = useState(true);
    const [housesUnlocked, setHousesUnlocked] = useState(() => unlockedContentIds.includes('houses_unlock'));
    const [expandedHouse, setExpandedHouse] = useState<number | null>(null);
    const [housesCollapsed, setHousesCollapsed] = useState(false);
    const [transitsUnlocked, setTransitsUnlocked] = useState(() => unlockedContentIds.includes('transits_unlock'));

    // Numerology
    const [numResult, setNumResult] = useState<NumerologyResult | null>(null);
    const [numAIResult, setNumAIResult] = useState<any>(null);
    const [numAILoading, setNumAILoading] = useState(false);
    const [numAIVisible, setNumAIVisible] = useState(false);

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

    // Build template variables
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

    // Fetch full analysis on mount
    useEffect(() => {
        (async () => {
            try {
                const data = await api.astrology.fullAnalysis();
                setAnalysisData(data);
            } catch (e) {
                console.log('Full analysis error:', e);
            } finally {
                setAnalysisLoading(false);
            }
        })();
    }, []);

    // Sync unlock states from DB-backed unlockedContentIds (persists across restarts)
    useEffect(() => {
        if (unlockedContentIds.includes('houses_unlock')) setHousesUnlocked(true);
        if (unlockedContentIds.includes('transits_unlock')) setTransitsUnlocked(true);
    }, [unlockedContentIds]);

    // Calculate numerology
    useEffect(() => {
        if (profile.name && profile.birthDate) {
            const result = calculateAll(profile.name, profile.birthDate);
            setNumResult(result);
            // Restore purchased AI numerology from db if it exists
            if ((profile as any).numerologyAI) {
                setNumAIResult((profile as any).numerologyAI);
            }
        }
    }, [profile.name, profile.birthDate, (profile as any).numerologyAI]);

    const handleNumerologyAI = async () => {
        if (!numResult) return;
        const cost = 45;
        if (credits < cost) {
            Alert.alert('Yetersiz Kredi', `Numeroloji yorumu için ${cost} kredi gerekli. Profil sayfasından reklam izleyerek kredi kazanabilirsiniz.`);
            return;
        }
        setNumAILoading(true);
        try {
            const result = await api.readings.numerologyAI({
                lifePath: numResult.lifePath,
                expression: numResult.expression,
                soulUrge: numResult.soulUrge,
                personality: numResult.personality,
            });
            setNumAIResult(result);
            setNumAIVisible(true);
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Numeroloji yorumu alınamadı');
        } finally {
            setNumAILoading(false);
        }
    };

    const FREE_HOUSES = [5, 7];

    const ruhsalAnaliz = homeTemplates?.ruhsalAnaliz
        ? fillTemplate(pickRandom(homeTemplates.ruhsalAnaliz), vars)
        : '';
    const haftalikKehanet = homeTemplates?.haftalikKehanet
        ? fillTemplate(pickRandom(homeTemplates.haftalikKehanet), vars)
        : '';

    const handleUnlockHouses = async () => {
        const cost = 50;
        if (credits < cost) {
            Alert.alert('Yetersiz Kredi', `Tüm evleri açmak için ${cost} kredi gerekli. Profil sayfasından reklam izleyerek kredi kazanabilirsiniz.`);
            return;
        }
        Alert.alert(
            'Tüm Evleri Aç',
            `${cost} kredi harcayarak 12 evin tamamını açmak ister misiniz?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Aç',
                    onPress: async () => {
                        try {
                            await api.entitlements.spend(cost, 'houses_unlock', 'houses_unlock');
                            setHousesUnlocked(true);
                            await refreshEnt();
                        } catch (e: any) {
                            Alert.alert('Hata', e.message || 'İşlem başarısız');
                        }
                    },
                },
            ]
        );
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        setHoraryLoading(true);
        try {
            const result = await api.readings.question(question.trim());
            const answer = result.answer || 'Yıldızlar şu an sessiz...';
            setHoraryAnswer(answer);
            try {
                addQuestion({
                    id: Date.now().toString(36),
                    date: new Date().toISOString(),
                    question,
                    answer,
                });
            } catch (e) {
                // non-critical
            }
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Soru gönderilemedi');
        } finally {
            setHoraryLoading(false);
        }
    };

    // Analysis sections below will show inline loading if analysisLoading is true

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Merhaba, {profile.name}</Text>
                    <View style={styles.pills}>
                        <PillBadge
                            label="Kredi"
                            value={credits}
                            icon="wallet-outline"
                            color={Colors.accentYellow}
                        />
                        <PillBadge
                            label="Soru"
                            value={`${dailyQuestionsRemaining}/3`}
                            icon="chatbubble-outline"
                            color={Colors.purpleLight}
                        />
                        <PillBadge
                            label="Gun"
                            value={streakDays}
                            icon="flame-outline"
                            color={Colors.warning}
                        />
                    </View>
                </View>

                {/* Natal Snapshot — compact strip */}
                <View style={styles.natalStrip}>
                    <View style={styles.natalItem}>
                        <Image
                            source={{ uri: getZodiacImage(profile.sunSign) }}
                            style={{ width: 24, height: 24, tintColor: Colors.accentYellow }}
                            resizeMode="contain"
                            onError={(e) => console.log('❌ Image load error:', e.nativeEvent.error, 'URL:', getZodiacImage(profile.sunSign))}
                            onLoad={() => console.log('✅ Image loaded:', getZodiacImage(profile.sunSign))}
                        />
                        <Text style={styles.natalLabel}>Gunes</Text>
                        <Text style={styles.natalValue}>{profile.sunSign || '—'}</Text>
                    </View>
                    <View style={styles.natalDivider} />
                    <View style={styles.natalItem}>
                        <Image source={{ uri: getZodiacImage(profile.moonSign) }} style={{ width: 24, height: 24, tintColor: Colors.purpleLight }} resizeMode="contain" />
                        <Text style={styles.natalLabel}>Ay</Text>
                        <Text style={styles.natalValue}>{profile.moonSign || '—'}</Text>
                    </View>
                    <View style={styles.natalDivider} />
                    <View style={styles.natalItem}>
                        <Image source={{ uri: getZodiacImage(profile.risingSign) }} style={{ width: 24, height: 24, tintColor: Colors.info }} resizeMode="contain" />
                        <Text style={styles.natalLabel}>Yukselen</Text>
                        <Text style={styles.natalValue}>{profile.risingSign || '—'}</Text>
                    </View>
                    <View style={styles.natalDivider} />
                    <View style={styles.natalItem}>
                        <Image source={{ uri: getElementImage(profile.element || 'Su') }} style={{ width: 24, height: 24, tintColor: Colors.success }} resizeMode="contain" />
                        <Text style={styles.natalLabel}>Element</Text>
                        <Text style={styles.natalValue}>{profile.element || '—'}</Text>
                    </View>
                </View>

                {/* Numeroloji */}
                {numResult && (
                    <View style={styles.numSection}>
                        <View style={styles.numHeader}>
                            <Ionicons name="grid-outline" size={20} color={Colors.accentYellow} />
                            <Text style={styles.numTitle}>Numeroloji</Text>
                        </View>
                        <View style={styles.numGrid}>
                            {[
                                { label: 'Yaşam Yolu', value: numResult.lifePath, color: Colors.accentYellow },
                                { label: 'Kader', value: numResult.expression, color: Colors.purpleLight },
                                { label: 'Ruh Arzu', value: numResult.soulUrge, color: Colors.info },
                                { label: 'Kişilik', value: numResult.personality, color: '#F472B6' },
                            ].map((n, i) => (
                                <View key={i} style={styles.numItem}>
                                    <View style={[styles.numCircle, { borderColor: n.color }]}>
                                        <Text style={[styles.numValue, { color: n.color }]}>{n.value}</Text>
                                    </View>
                                    <Text style={styles.numLabel}>{n.label}</Text>
                                </View>
                            ))}
                        </View>
                        {!numAIVisible ? (
                            numAIResult ? (
                                <TouchableOpacity
                                    style={[styles.numBtn, { backgroundColor: Colors.purple + '40' }]}
                                    onPress={() => setNumAIVisible(true)}
                                >
                                    <Ionicons name="eye-outline" size={16} color={Colors.textPrimary} />
                                    <Text style={[styles.numBtnText, { color: Colors.textPrimary }]}>Yorumları Göster</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.numBtn}
                                    onPress={handleNumerologyAI}
                                    disabled={numAILoading}
                                >
                                    {numAILoading ? (
                                        <ActivityIndicator size="small" color={Colors.backgroundDark} />
                                    ) : (
                                        <>
                                            <Ionicons name="sparkles" size={16} color={Colors.backgroundDark} />
                                            <Text style={styles.numBtnText}>Anlamlarını Öğren (45 Kredi)</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )
                        ) : numAIResult && (
                            <View style={styles.numAIResult}>
                                {[
                                    { label: 'Yaşam Yolu', text: numAIResult.lifePath },
                                    { label: 'Kader/İfade', text: numAIResult.expression },
                                    { label: 'Ruh Arzu', text: numAIResult.soulUrge },
                                    { label: 'Kişilik', text: numAIResult.personality },
                                    { label: 'Genel Yorum', text: numAIResult.genel },
                                ].map((item, i) => (
                                    <View key={i} style={styles.numAIItem}>
                                        <Text style={styles.numAILabel}>{item.label}</Text>
                                        <Text style={styles.numAIText}>{item.text}</Text>
                                    </View>
                                ))}
                                <TouchableOpacity
                                    style={styles.numCollapseBtn}
                                    onPress={() => setNumAIVisible(false)}
                                >
                                    <Ionicons name="chevron-up" size={16} color={Colors.textMuted} />
                                    <Text style={styles.numCollapseBtnText}>Küçült</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Arketip */}
                <DeityArchetype />

                {/* Gunluk Tarot */}
                <DailyTarot />

                {/* Ay Döngüsü */}
                {profile.currentMoon && (
                    <KismetCard glow style={{ marginBottom: Spacing.xl }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                            <Image
                                source={{ uri: `${API_HOST}/images/ay/${profile.currentMoon.image}` }}
                                style={{ width: 60, height: 60, tintColor: Colors.textPrimary }}
                                resizeMode="contain"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 }}>Ay Döngüsü</Text>
                                <Text style={{ fontSize: FontSize.md, color: Colors.purpleLight, fontWeight: '600' }}>{profile.currentMoon.phase}</Text>
                                <Text style={{ fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 }}>Aydınlanma: %{profile.currentMoon.illumination}</Text>
                            </View>
                        </View>
                    </KismetCard>
                )}

                {/* Horary Astroloji */}
                <View style={styles.horarySection}>
                    <View style={styles.horaryHeader}>
                        <Ionicons name="planet-outline" size={20} color={Colors.accentYellow} />
                        <Text style={styles.horaryTitle}>Horary Astroloji</Text>
                        <View style={styles.horaryBadge}>
                            <Text style={styles.horaryBadgeText}>
                                {dailyQuestionsRemaining > 0
                                    ? `${dailyQuestionsRemaining}/3 ucretsiz`
                                    : '150 kredi'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.horaryDesc}>
                        Sorunuzun soruldugu anin gokyuzu konumlarina gore hazirlanan kisisel analiz.
                    </Text>
                    {!horaryAnswer ? (
                        <View style={styles.askInput}>
                            <TextInput
                                style={styles.questionInput}
                                placeholder="Sorunuzu yazin..."
                                placeholderTextColor={Colors.textMuted}
                                value={question}
                                onChangeText={setQuestion}
                                editable={!horaryLoading}
                            />
                            {horaryLoading ? (
                                <ActivityIndicator size="small" color={Colors.accentYellow} style={{ width: 44, height: 44 }} />
                            ) : (
                                <TouchableOpacity
                                    style={[styles.askBtn, !question.trim() && { opacity: 0.4 }]}
                                    disabled={!question.trim()}
                                    onPress={handleAskQuestion}
                                >
                                    <Ionicons name="send" size={18} color={Colors.backgroundDark} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View>
                            <KismetCard glow style={styles.horaryResult}>
                                <Text style={styles.horaryQ}>"{question}"</Text>
                                <View style={styles.horaryDivider} />
                                <Text style={styles.horaryA}>{horaryAnswer}</Text>
                            </KismetCard>
                            <TouchableOpacity
                                style={styles.horaryReset}
                                onPress={() => {
                                    setHoraryAnswer(null);
                                    setQuestion('');
                                }}
                            >
                                <Ionicons name="refresh" size={14} color={Colors.purpleLight} />
                                <Text style={styles.horaryResetText}>Yeni soru sor</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Ev Bilgileri */}
                {analysisData?.houses && (
                    <View style={styles.housesSection}>
                        <View style={styles.housesSectionHeader}>
                            <Ionicons name="home-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.housesSectionTitle}>Ev Bilgileri</Text>
                            {housesUnlocked && (
                                <TouchableOpacity onPress={() => setHousesCollapsed(!housesCollapsed)}>
                                    <Ionicons
                                        name={housesCollapsed ? 'chevron-down' : 'chevron-up'}
                                        size={20}
                                        color={Colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* Show only houses 5 & 7 when locked, all when unlocked */}
                        {(!housesUnlocked || !housesCollapsed) && analysisData.houses
                            .filter((h: any) => housesUnlocked || FREE_HOUSES.includes(h.house))
                            .map((h: any) => {
                                const isExpanded = expandedHouse === h.house;
                                return (
                                    <TouchableOpacity
                                        key={h.house}
                                        style={[styles.houseItem, isExpanded && styles.houseItemExpanded]}
                                        onPress={() => setExpandedHouse(isExpanded ? null : h.house)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.houseItemHeader}>
                                            <Text style={styles.houseNumber}>{h.house}. Ev</Text>
                                            <Text style={styles.houseSign}>{h.sign}</Text>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={14}
                                                color={Colors.textSecondary}
                                            />
                                        </View>
                                        {isExpanded && (
                                            <View style={styles.houseDetail}>
                                                <Text style={styles.houseMeaning}>{h.meaning}</Text>
                                                {h.planets.length > 0 && (
                                                    <View style={styles.housePlanets}>
                                                        {h.planets.map((p: any, pi: number) => (
                                                            <Text key={pi} style={styles.housePlanet}>
                                                                {p.name} ({p.sign}) {p.isRetrograde ? '℞' : ''}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        {!housesUnlocked && (
                            <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlockHouses}>
                                <Ionicons name="lock-open-outline" size={16} color={Colors.backgroundDark} />
                                <Text style={styles.unlockBtnText}>Tüm Evleri Aç (50 Kredi)</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Aşk & İlişkiler */}
                {analysisData?.loveAnalysis && (
                    <View style={styles.loveSection}>
                        <View style={styles.loveSectionHeader}>
                            <Ionicons name="heart" size={20} color={Colors.error} />
                            <Text style={styles.loveSectionTitle}>Aşk & İlişkiler</Text>
                        </View>
                        <View style={styles.loveCard}>
                            <Text style={styles.loveLabel}>İLİŞKİ DİNAMİĞİ & HATALARI</Text>
                            <Text style={styles.loveText}>{analysisData.loveAnalysis.mistakes}</Text>
                        </View>
                        <View style={styles.loveCard}>
                            <Text style={styles.loveLabel}>İDEAL PARTNER PROFİLİ</Text>
                            <Text style={styles.loveText}>{analysisData.loveAnalysis.idealPartner}</Text>
                        </View>
                        <View style={styles.loveCard}>
                            <Text style={styles.loveLabel}>ÇEKİM ALANI</Text>
                            <Text style={styles.loveText}>{analysisData.loveAnalysis.attractionDynamics}</Text>
                        </View>
                    </View>
                )}

                {/* Retrograde Gezegen Bilgisi — below love */}
                {analysisData?.retrogradePlanets && (
                    <View style={styles.retroStrip}>
                        <Ionicons name="sync-outline" size={16} color={Colors.warning} />
                        <Text style={styles.retroLabel}>Retrograd:</Text>
                        {analysisData.retrogradePlanets.length > 0 ? (
                            analysisData.retrogradePlanets.map((p: any, i: number) => (
                                <View key={i} style={styles.retroBadge}>
                                    <Text style={styles.retroText}>{p.name} ℞</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.retroText, { color: Colors.textMuted, marginLeft: 4 }]}>Retrograd gezegeniniz bulunmamaktadır.</Text>
                        )}
                    </View>
                )}

                {/* Transit Bilgileri — kilitli */}
                {analysisData?.transits && (
                    <View style={styles.housesSection}>
                        <View style={styles.housesSectionHeader}>
                            <Ionicons name="planet-outline" size={20} color={Colors.accentYellow} />
                            <Text style={styles.housesSectionTitle}>Transitler</Text>
                        </View>
                        {!transitsUnlocked ? (
                            <View>
                                <View style={styles.lockedTransitPreview}>
                                    <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
                                    <Text style={styles.lockedTransitText}>
                                        {analysisData.transits.length} transit görüntülenmeyi bekliyor
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.unlockBtn}
                                    onPress={async () => {
                                        const cost = 50;
                                        if (credits < cost) {
                                            Alert.alert('Yetersiz Kredi', `Transitleri açmak için ${cost} kredi gerekli. Profil sayfasından reklam izleyerek kredi kazanabilirsiniz.`);
                                            return;
                                        }
                                        Alert.alert(
                                            'Transitleri Aç',
                                            `${cost} kredi harcayarak tüm transitleri görmek ister misiniz?`,
                                            [
                                                { text: 'Vazgeç', style: 'cancel' },
                                                {
                                                    text: 'Aç',
                                                    onPress: async () => {
                                                        try {
                                                            await api.entitlements.spend(cost, 'transits_unlock', 'transits_unlock');
                                                            setTransitsUnlocked(true);
                                                            await refreshEnt();
                                                        } catch (e: any) {
                                                            Alert.alert('Hata', e.message || 'İşlem başarısız');
                                                        }
                                                    },
                                                },
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons name="lock-open-outline" size={16} color={Colors.backgroundDark} />
                                    <Text style={styles.unlockBtnText}>Transitleri Aç (50 Kredi)</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {analysisData.transits.map((t: any, i: number) => (
                                    <View key={i} style={styles.houseItem}>
                                        <View style={styles.houseItemHeader}>
                                            <Text style={styles.houseNumber}>{t.transitPlanet || t.planet}</Text>
                                            <Text style={styles.houseSign}>{t.aspect || ''}</Text>
                                        </View>
                                        <Text style={styles.houseMeaning}>{t.interpretation || t.effect || ''}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* CTA Row */}
                <View style={styles.ctaRow}>
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={() => router.push('/tarot-reading')}
                    >
                        <Ionicons name="layers-outline" size={24} color={Colors.accentYellow} />
                        <Text style={styles.ctaText}>Tarot Karti Cek</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={() => router.push('/coffee-reading')}
                    >
                        <Ionicons name="cafe-outline" size={24} color={Colors.purpleLight} />
                        <Text style={styles.ctaText}>Fal Baktir</Text>
                    </TouchableOpacity>
                </View>
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
    header: {
        marginBottom: Spacing.xxl,
    },
    greeting: {
        fontSize: FontSize.title,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    pills: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    card: {
        marginBottom: Spacing.lg,
    },
    cardText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    cardSubtext: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    natalStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },
    natalItem: {
        alignItems: 'center',
        gap: 2,
    },
    natalDivider: {
        width: 1,
        height: 28,
        backgroundColor: Colors.border,
    },
    natalLabel: {
        fontSize: 10,
        color: Colors.textMuted,
    },
    natalValue: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    deityName: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.accentYellow,
    },
    askInput: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
        gap: Spacing.sm,
    },
    questionInput: {
        flex: 1,
        backgroundColor: Colors.backgroundCardLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    askBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accentYellow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    ctaBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.backgroundCard,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
    },
    ctaText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    horarySection: {
        marginBottom: Spacing.xl,
    },
    horaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    horaryTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
    },
    horaryBadge: {
        backgroundColor: Colors.purple + '25',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    horaryBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.purpleLight,
    },
    horaryDesc: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
        lineHeight: 18,
    },
    horaryResult: {
        marginTop: Spacing.sm,
    },
    horaryQ: {
        fontSize: FontSize.md,
        color: Colors.purpleLight,
        fontStyle: 'italic',
        marginBottom: Spacing.sm,
    },
    horaryDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.sm,
    },
    horaryA: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    horaryReset: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    horaryResetText: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        fontWeight: '500',
    },
    // Retrograde strip
    retroStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.warning + '40',
        marginBottom: Spacing.lg,
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    retroLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.warning,
        marginLeft: Spacing.xs,
    },
    retroBadge: {
        backgroundColor: Colors.warning + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    retroText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.warning,
    },
    // Love section
    loveSection: {
        marginBottom: Spacing.xl,
    },
    loveSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    loveSectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    loveCard: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    loveLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.error,
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    loveText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    // Houses section
    housesSection: {
        marginBottom: Spacing.xl,
    },
    housesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    housesSectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    houseItem: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xs,
    },
    houseItemExpanded: {
        borderColor: Colors.purpleLight + '60',
    },
    houseItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    houseNumber: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textPrimary,
        width: 50,
    },
    houseSign: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        flex: 1,
    },
    houseDetail: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    houseMeaning: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    housePlanets: {
        marginTop: Spacing.xs,
        gap: 2,
    },
    housePlanet: {
        fontSize: FontSize.xs,
        color: Colors.accentYellow,
        fontWeight: '500',
    },
    unlockBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentYellow,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        marginTop: Spacing.sm,
    },
    unlockBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.backgroundDark,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120,
    },
    loadingOverlayText: {
        fontSize: FontSize.xl,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: Spacing.xl,
        textAlign: 'center',
    },
    loadingOverlaySubtext: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: Spacing.sm,
    },
    lockedTransitPreview: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    lockedTransitText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    // Numeroloji
    numSection: {
        marginBottom: Spacing.xl,
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    numHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    numTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    numGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spacing.lg,
    },
    numItem: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    numCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    numValue: {
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    numLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    numBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accentYellow,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
    },
    numBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.backgroundDark,
    },
    numAIResult: {
        marginTop: Spacing.md,
    },
    numAIItem: {
        marginBottom: Spacing.md,
    },
    numAILabel: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.accentYellow,
        marginBottom: 4,
    },
    numAIText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    numCollapseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    numCollapseBtnText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontWeight: '500',
    },
});
