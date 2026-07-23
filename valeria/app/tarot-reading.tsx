import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Animated, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, PrimaryButton, SecondaryButton } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';
import * as api from '../src/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 3;

import { API_HOST } from '../src/api';

export default function TarotReadingScreen() {
    const [question, setQuestion] = useState('');
    const [phase, setPhase] = useState<'question' | 'drawing' | 'reveal'>('question');
    const [loading, setLoading] = useState(false);
    const [cards, setCards] = useState<any[]>([]);
    const [aiResponse, setAiResponse] = useState('');
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const flipAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const drawCards = async () => {
        setLoading(true);
        try {
            const result = await api.readings.tarot(question || undefined);
            const rawCards = result.cards || [];
            // Map backend format: each item has { card: {...}, isReversed, interpretation }
            const mappedCards = rawCards.map((c: any, idx: number) => ({
                nameTR: c.card?.nameTR || c.nameTR || `Kart ${idx + 1}`,
                nameEN: c.card?.nameEN || c.nameEN || '',
                id: c.card?.id ?? null,
                isReversed: c.isReversed || false,
                position: ['Geçmiş', 'Şimdi', 'Gelecek'][idx],
                interpretation: c.interpretation || '',
            }));
            setCards(mappedCards);
            // Build combined AI response from per-card interpretations
            const combinedAI = mappedCards
                .map((c: any) => `**${c.nameTR}** (${c.position}): ${c.interpretation}`)
                .join('\n\n');
            setAiResponse(combinedAI || '');
            setPhase('drawing');

            // Animate card flips sequentially
            const animations = flipAnims.map((anim, idx) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 600,
                    delay: idx * 400,
                    useNativeDriver: true,
                })
            );

            Animated.stagger(400, animations).start(() => {
                setPhase('reveal');
            });

            // Refresh credits
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Tarot okuması yapılamadı');
        } finally {
            setLoading(false);
        }
    };

    const positions = ['Geçmiş', 'Şimdi', 'Gelecek'];

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Tarot Okuması</Text>
                    <View style={{ width: 28 }} />
                </View>

                {phase === 'question' && (
                    <View>
                        <KismetCard glow style={styles.questionCard}>
                            <Ionicons name="layers" size={48} color={Colors.accentYellow} />
                            <Text style={styles.questionTitle}>3 Kartlı Okuma</Text>
                            <Text style={styles.questionDesc}>
                                Sorunuzu düşünün veya yazın. Ardından kartlarınızı çekin.
                            </Text>
                            <TextInput
                                style={styles.questionInput}
                                placeholder="Sorunuzu buraya yazın (isteğe bağlı)..."
                                placeholderTextColor={Colors.textMuted}
                                value={question}
                                onChangeText={setQuestion}
                                multiline
                                numberOfLines={3}
                                editable={!loading}
                            />
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={Colors.accentYellow} />
                                    <Text style={styles.loadingText}>Kartlar çekiliyor...</Text>
                                    <Text style={styles.loadingSubtext}>Evren sizin için yorumluyor</Text>
                                </View>
                            ) : (
                                <PrimaryButton
                                    title="Kartları Çek"
                                    onPress={drawCards}
                                    style={styles.drawBtn}
                                />
                            )}
                        </KismetCard>
                    </View>
                )}

                {(phase === 'drawing' || phase === 'reveal') && (
                    <View>
                        {/* Cards Row */}
                        <View style={styles.cardsRow}>
                            {cards.map((card: any, idx: number) => {
                                const spin = flipAnims[idx]?.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: ['0deg', '90deg', '0deg'],
                                });
                                const opacity = flipAnims[idx]?.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: [0.3, 0, 1],
                                });

                                return (
                                    <Animated.View
                                        key={idx}
                                        style={[
                                            styles.cardContainer,
                                            {
                                                transform: [{ rotateY: spin }],
                                                opacity,
                                            },
                                        ]}
                                    >
                                        <KismetCard glow style={styles.tarotCard}>
                                            <Text style={styles.positionLabel}>{card.position || positions[idx]}</Text>
                                            <Image
                                                source={{ uri: `${API_HOST}/images/cards/${card.id}.jpeg` }}
                                                style={[
                                                    { width: 70, height: 112, borderRadius: 8 },
                                                    card.isReversed && { transform: [{ rotate: '180deg' }] }
                                                ]}
                                                resizeMode="cover"
                                            />
                                            <Text style={styles.cardName}>{card.nameTR}</Text>
                                        </KismetCard>
                                    </Animated.View>
                                );
                            })}
                        </View>

                        {/* AI Interpretation */}
                        {phase === 'reveal' && aiResponse ? (
                            <KismetCard glow style={styles.readingCard}>
                                <Text style={styles.readingPosition}>Valeria'nın Yorumu</Text>
                                <Text style={styles.readingInterpretation}>{aiResponse}</Text>
                            </KismetCard>
                        ) : null}

                        {phase === 'reveal' && (
                            <View style={styles.actionRow}>
                                <PrimaryButton
                                    title="Yeni Okuma"
                                    onPress={() => {
                                        setPhase('question');
                                        setCards([]);
                                        setAiResponse('');
                                        setQuestion('');
                                        flipAnims.forEach((a) => a.setValue(0));
                                    }}
                                />
                                <SecondaryButton
                                    title="Geri Dön"
                                    onPress={() => router.back()}
                                />
                            </View>
                        )}
                    </View>
                )}
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
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        paddingTop: 40,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    questionCard: {
        alignItems: 'center',
        gap: Spacing.lg,
    },
    questionTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    questionDesc: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    questionInput: {
        width: '100%',
        backgroundColor: Colors.backgroundCardLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    drawBtn: {
        width: '100%',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    cardContainer: {
        width: CARD_WIDTH,
    },
    tarotCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.sm,
        gap: Spacing.sm,
    },
    positionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardName: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    cardOrientation: {
        fontSize: FontSize.xs,
        color: Colors.purpleLight,
    },
    readingCard: {
        marginBottom: Spacing.lg,
    },
    readingHeader: {
        marginBottom: Spacing.md,
    },
    readingPosition: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    readingName: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.accentYellow,
        marginTop: 2,
    },
    readingOrientation: {
        fontSize: FontSize.sm,
        fontWeight: '500',
        marginTop: 2,
    },
    readingKeywords: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        marginBottom: Spacing.md,
        fontWeight: '500',
    },
    readingInterpretation: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    actionRow: {
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.accentYellow,
    },
    loadingSubtext: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
});
