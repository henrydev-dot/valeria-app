import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Image,
    Modal,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontSize, Spacing, BorderRadius } from '../theme/spacing';
import { AppText } from './AppText';
import { Card } from './Card';
import { Button } from './Button';
import TAROT_DATA from '../../content/tarot_major_arcana_tr.json';
import { useEntitlementsStore } from '../stores/useEntitlementsStore';
import { useUserStore } from '../stores/useUserStore';
import { UserRepository } from '../repositories/UserRepository';
import type { TarotCard } from '../types';
import * as api from '../api';

const { width } = Dimensions.get('window');
// Kullanılabilir iç genişlik: ekran − Screen yatay padding (20×2) − Card padding
// (20×2) − kartlar arası 2 boşluk (12×2). Boşluklar düşülmezse satır taşar ve
// kenar kartlar kırpılır (ortadaki kart "büyük" görünür).
const CARD_GAP = Spacing.md;
const CARD_W = Math.floor((width - 80 - CARD_GAP * 2) / 3);
// Kart görselleri 600×1066 (1:1.777) — çerçeve aynı oranda olmalı ki görsel kırpılmasın.
const CARD_H = Math.round(CARD_W * 1.777);

// Card images from backend static server
import { API_HOST } from '../api';

function cardImage(id: number) {
    return { uri: `${API_HOST}/images/cards/${id}.jpeg` };
}

const BACK_IMAGE = { uri: `${API_HOST}/images/cards/back.jpeg` };

interface DailyTarotState {
    date: string;
    revealedCards: { index: number; cardId: number; isReversed: boolean }[];
}

export function DailyTarot() {
    const tarotCards: TarotCard[] = TAROT_DATA as TarotCard[];
    const { spendCredits } = useEntitlementsStore();
    const credits = useEntitlementsStore((s) => s.credits);
    const profileId = useUserStore((s) => s.profile._id) || 'guest';

    const [dailyState, setDailyState] = useState<DailyTarotState | null>(null);
    const [todayCards, setTodayCards] = useState<number[]>([]);
    const [selectedCard, setSelectedCard] = useState<{
        card: TarotCard;
        isReversed: boolean;
        index: number;
    } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [aiReading, setAiReading] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const sunSign = useUserStore((s) => s.profile.sunSign) || '';
    const [resetTimer, setResetTimer] = useState('');

    // Midnight Turkey-time (UTC+3) countdown timer
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            // Turkey time = UTC + 3
            const turkeyNow = new Date(now.getTime() + (3 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
            const midnight = new Date(turkeyNow);
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - turkeyNow.getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setResetTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const flipAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const today = new Date().toISOString().split('T')[0];

    // On mount: load or create today's daily tarot state
    useEffect(() => {
        loadDailyState();
    }, [tarotCards]);

    const loadDailyState = async () => {
        if (tarotCards.length === 0) return;

        const saved = await UserRepository.getSettings();
        const savedState = saved?.dailyTarot as DailyTarotState | undefined;

        if (savedState && savedState.date === today) {
            setDailyState(savedState);
            setTodayCards(getDailyCardIds(savedState.date, tarotCards.length, profileId));
            // Restore revealed animations
            savedState.revealedCards.forEach((rc) => {
                flipAnims[rc.index].setValue(1);
            });
        } else {
            // New day — generate fresh cards
            const cardIds = getDailyCardIds(today, tarotCards.length, profileId);
            const newState: DailyTarotState = {
                date: today,
                revealedCards: [],
            };
            setDailyState(newState);
            setTodayCards(cardIds);
            await UserRepository.saveSetting('dailyTarot', newState);
        }
    };

    // Deterministic daily card selection (seeded by date + user id)
    const getDailyCardIds = (dateStr: string, totalCards: number, userId: string = 'guest'): number[] => {
        let seed = dateStr.split('-').reduce((acc, p) => acc + parseInt(p, 10), 0);
        for (let i = 0; i < userId.length; i++) {
            seed += userId.charCodeAt(i);
        }
        const ids: number[] = [];
        let s = seed;
        while (ids.length < 3) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            const id = Math.abs(s) % totalCards;
            if (!ids.includes(id)) ids.push(id);
        }
        return ids;
    };

    const isRevealed = (index: number): boolean => {
        return dailyState?.revealedCards.some((rc) => rc.index === index) ?? false;
    };

    const revealedCount = dailyState?.revealedCards.length ?? 0;

    const handleCardPress = async (index: number) => {
        if (isRevealed(index)) {
            // Already revealed — show details
            const rc = dailyState!.revealedCards.find((r) => r.index === index)!;
            const card = tarotCards.find((c) => c.id === rc.cardId);
            if (card) {
                setSelectedCard({ card, isReversed: rc.isReversed, index });
                setShowModal(true);
            }
            return;
        }

        // Tiered pricing: 1st free, 2nd 5 credits, 3rd 10 credits
        const cardCost = revealedCount === 0 ? 0 : revealedCount === 1 ? 5 : 10;
        if (cardCost > 0) {
            const success = await spendCredits(cardCost);
            if (!success) {
                Alert.alert(
                    'Yetersiz Kredi',
                    `Bu kartı açmak için ${cardCost} kredi gerekiyor. Mevcut: ${credits}`,
                );
                return;
            }
        }

        // Flip animation
        const cardId = todayCards[index];
        const isReversed = Math.random() > 0.6;

        Animated.timing(flipAnims[index], {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start();

        // Save state
        const newRevealed = [
            ...(dailyState?.revealedCards ?? []),
            { index, cardId, isReversed },
        ];
        const newState: DailyTarotState = {
            date: today,
            revealedCards: newRevealed,
        };
        setDailyState(newState);
        UserRepository.saveSetting('dailyTarot', newState);

        // XP awarding can be added when earnXP is available

        // Show detail modal after animation
        setTimeout(async () => {
            const card = tarotCards.find((c) => c.id === cardId);
            if (card) {
                setSelectedCard({ card, isReversed, index });
                setShowModal(true);
                // Fetch AI reading
                setAiReading(null);
                setAiLoading(true);
                try {
                    const resp = await api.readings.tarotAI({
                        cardName: card.nameTR,
                        isReversed,
                        sunSign,
                    });
                    setAiReading(resp.reading || resp.interpretation || null);
                } catch (e) {
                    setAiReading(null);
                } finally {
                    setAiLoading(false);
                }
            }
        }, 750);
    };

    if (tarotCards.length === 0 || todayCards.length < 3) return null;

    return (
        <Card>
            {/* Header */}
            <View style={styles.header}>
                <AppText variant="caption" color={Colors.textMuted}>
                    {revealedCount}/3 kart açıldı
                </AppText>
                <View style={styles.timerRow}>
                    <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                    <AppText variant="caption" color={Colors.textMuted}>
                        Yenileme: {resetTimer}
                    </AppText>
                </View>
            </View>

            {/* Cards Row */}
            <View style={styles.cardsRow}>
                {todayCards.map((cardId, index) => {
                    const revealed = isRevealed(index);
                    const card = tarotCards.find((c) => c.id === cardId);
                    const rc = dailyState?.revealedCards.find((r) => r.index === index);

                    // Front/back interpolation
                    const frontOpacity = flipAnims[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0, 1],
                    });
                    const backOpacity = flipAnims[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0, 0],
                    });
                    const rotateY = flipAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                    });

                    // Cost label per card position
                    const costLabel = index === 0 ? 'ÜCRETSİZ' : index === 1 ? '5 Kredi' : '10 Kredi';
                    const isFreeCard = index === 0;

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.85}
                            onPress={() => handleCardPress(index)}
                            style={styles.cardWrapper}
                            accessibilityRole="button"
                            accessibilityLabel={
                                revealed
                                    ? `${card?.nameTR ?? 'Kart'} — detayları gör`
                                    : `${index + 1}. kartı aç (${costLabel})`
                            }
                        >
                            {/* Back of card */}
                            <Animated.View
                                style={[
                                    styles.cardFace,
                                    styles.cardBack,
                                    { opacity: backOpacity },
                                ]}
                            >
                                <Image
                                    source={BACK_IMAGE}
                                    style={styles.cardImage}
                                    resizeMode="cover"
                                />
                                {/* Overlay badge */}
                                {!revealed && (
                                    <View style={styles.badge}>
                                        {isFreeCard ? (
                                            <Text style={styles.badgeFree}>{costLabel}</Text>
                                        ) : (
                                            <View style={styles.badgeCredit}>
                                                <Ionicons name="wallet-outline" size={10} color={Colors.textOnAccent} />
                                                <Text style={styles.badgeCreditText}>{costLabel}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                                {/* Tap hint */}
                                {!revealed && (
                                    <View style={styles.tapHint}>
                                        <Ionicons name="hand-left-outline" size={16} color={Colors.textPrimary} />
                                    </View>
                                )}
                            </Animated.View>

                            {/* Front of card (revealed) */}
                            <Animated.View
                                style={[
                                    styles.cardFace,
                                    styles.cardFront,
                                    { opacity: frontOpacity },
                                ]}
                            >
                                {card && (
                                    <>
                                        <Image
                                            source={cardImage(cardId)}
                                            style={[
                                                styles.cardImage,
                                                rc?.isReversed && { transform: [{ rotate: '180deg' }] },
                                            ]}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.cardLabel}>
                                            <AppText
                                                variant="caption"
                                                color={Colors.textPrimary}
                                                center
                                                numberOfLines={1}
                                                style={styles.cardName}
                                            >
                                                {card.nameTR}
                                            </AppText>
                                        </View>
                                    </>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Detail Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView
                            contentContainerStyle={styles.modalScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setShowModal(false)}
                                accessibilityRole="button"
                                accessibilityLabel="Kapat"
                            >
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>

                            {selectedCard && (
                                <>
                                    {/* Card Image */}
                                    <View style={styles.modalImageContainer}>
                                        <Image
                                            source={cardImage(selectedCard.card.id)}
                                            style={[
                                                styles.modalImage,
                                                selectedCard.isReversed && { transform: [{ rotate: '180deg' }] },
                                            ]}
                                            resizeMode="contain"
                                        />
                                    </View>

                                    {/* Card Name + Orientation */}
                                    <AppText variant="title" color={Colors.accentYellow} center>
                                        {selectedCard.card.nameTR}
                                    </AppText>
                                    <AppText variant="callout" color={Colors.textMuted} center style={styles.modalNameEN}>
                                        {selectedCard.card.nameEN}
                                    </AppText>
                                    <View style={[
                                        styles.orientationBadge,
                                        { backgroundColor: selectedCard.isReversed ? Colors.warning + '20' : Colors.success + '20' }
                                    ]}>
                                        <AppText
                                            variant="callout"
                                            color={selectedCard.isReversed ? Colors.warning : Colors.success}
                                        >
                                            {selectedCard.isReversed ? 'Ters Pozisyon' : 'Düz Pozisyon'}
                                        </AppText>
                                    </View>

                                    {/* Archetype */}
                                    <View style={styles.archetypeRow}>
                                        <Ionicons name="shield-outline" size={16} color={Colors.purpleLight} />
                                        <AppText variant="callout" color={Colors.purpleLight}>
                                            {selectedCard.card.archetypeTR}
                                        </AppText>
                                    </View>

                                    {/* Keywords */}
                                    <View style={styles.keywords}>
                                        {selectedCard.card.keywordsTR.map((kw, i) => (
                                            <View key={i} style={styles.keyword}>
                                                <AppText variant="caption" color={Colors.purpleLight}>{kw}</AppText>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Divider */}
                                    <View style={styles.divider} />

                                    {/* Meaning / Story */}
                                    <View style={styles.sectionTitleRow}>
                                        <Ionicons name="book-outline" size={16} color={Colors.accentYellow} />
                                        <AppText variant="h3">Kart Hikayesi ve Anlamı</AppText>
                                    </View>
                                    <AppText variant="body" style={styles.meaningText}>
                                        {selectedCard.isReversed
                                            ? selectedCard.card.reversedTR
                                            : selectedCard.card.uprightTR}
                                    </AppText>

                                    {/* Divider */}
                                    <View style={styles.divider} />

                                    {/* Advice */}
                                    <View style={styles.sectionTitleRow}>
                                        <Ionicons name="sparkles-outline" size={16} color={Colors.accentYellow} />
                                        <AppText variant="h3">Günlük Yorum</AppText>
                                    </View>
                                    <AppText variant="body" style={styles.adviceText}>
                                        {selectedCard.card.adviceTR}
                                    </AppText>

                                    {/* AI Gemini Kişiye Özel Yorum */}
                                    <View style={styles.divider} />
                                    <View style={styles.sectionTitleRow}>
                                        <Ionicons name="sparkles" size={16} color={Colors.accentYellow} />
                                        <AppText variant="h3">Valeria'nın Yorumu</AppText>
                                    </View>
                                    {aiLoading ? (
                                        <View style={styles.aiLoadingContainer}>
                                            <ActivityIndicator size="small" color={Colors.accentYellow} />
                                            <AppText variant="caption" color={Colors.textMuted} style={styles.aiLoadingText}>
                                                Valeria yorumluyor...
                                            </AppText>
                                        </View>
                                    ) : aiReading ? (
                                        <AppText variant="body" style={styles.adviceText}>{aiReading}</AppText>
                                    ) : (
                                        <AppText variant="body" style={styles.adviceText}>
                                            Valeria'nın yorumu yüklenemedi.
                                        </AppText>
                                    )}

                                    {/* Close CTA */}
                                    <Button
                                        title="Kapat"
                                        onPress={() => setShowModal(false)}
                                        style={styles.closeCta}
                                    />
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Card>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    timerText: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '400',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: CARD_GAP,
    },
    cardWrapper: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    cardFace: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    cardBack: {
        zIndex: 2,
    },
    cardFront: {
        zIndex: 1,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.lg,
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
    badgeFree: {
        fontSize: 8,
        fontWeight: '800',
        color: Colors.backgroundDark,
        backgroundColor: Colors.success,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
        letterSpacing: 0.5,
    },
    badgeCredit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.accentYellow,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    badgeCreditText: {
        fontSize: 9,
        fontWeight: '800',
        color: Colors.backgroundDark,
    },
    tapHint: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        backgroundColor: Colors.overlay,
        borderRadius: 12,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.overlay,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    cardName: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.backgroundDark,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalScroll: {
        padding: Spacing.xxl,
        paddingBottom: 40,
    },
    closeBtn: {
        alignSelf: 'flex-end',
        padding: Spacing.xs,
    },
    modalImageContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalImage: {
        width: width * 0.45,
        height: width * 0.45 * 1.777,
        borderRadius: BorderRadius.xl,
    },
    modalName: {
        fontSize: FontSize.title,
        fontWeight: '700',
        color: Colors.accentYellow,
        textAlign: 'center',
    },
    modalNameEN: {
        fontSize: FontSize.md,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 2,
        marginBottom: Spacing.md,
    },
    orientationBadge: {
        alignSelf: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.lg,
    },
    orientationText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    archetypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    archetypeText: {
        fontSize: FontSize.md,
        color: Colors.purpleLight,
        fontWeight: '500',
    },
    keywords: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    keyword: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purple + '20',
        borderWidth: 1,
        borderColor: Colors.purple + '40',
    },
    keywordText: {
        fontSize: FontSize.xs,
        color: Colors.purpleLight,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    meaningText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 26,
    },
    adviceText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 26,
        fontStyle: 'italic',
    },
    // Button bileşeni kendi altın gradyan zeminini çizer — burada yalnız
    // boşluk verilir (ikinci bir sarı katman "buton içinde buton" yapıyordu).
    closeCta: {
        marginTop: Spacing.xxl,
    },
    aiLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    aiLoadingText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
});
