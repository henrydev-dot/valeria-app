import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TextInput,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    Screen,
    Header,
    AppText,
    Button,
    Card,
    LoadingView,
} from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../src/theme/spacing';
import * as api from '../src/api';
import { API_HOST } from '../src/api';
import { Features } from '../src/config';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const H_PADDING = Spacing.xl * 2;
const CARD_W = Math.floor((SCREEN_W - H_PADDING - CARD_GAP * 2) / 3);
const CARD_H = Math.round(CARD_W * 1.55);

const TAROT_COST = 30;
const POSITIONS = ['Geçmiş', 'Şimdi', 'Gelecek'];
const BACK_IMAGE = { uri: `${API_HOST}/images/cards/back.jpeg` };

interface DrawnCard {
    nameTR: string;
    nameEN: string;
    id: number | null;
    isReversed: boolean;
    position: string;
    interpretation: string;
}

/* ---- Inline markdown renderer: strips ** and renders bold segments ---- */
function parseInline(text: string): React.ReactNode[] {
    const clean = text
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/^\s*[-*]\s+/gm, '• ');
    const parts = clean.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
            return (
                <AppText key={i} variant="bodyStrong">
                    {bold[1]}
                </AppText>
            );
        }
        return part.replace(/\*/g, '');
    });
}

function RichText({ text }: { text: string }) {
    const paragraphs = text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
    return (
        <View style={styles.richText}>
            {paragraphs.map((para, i) => (
                <AppText key={i} variant="body">
                    {parseInline(para)}
                </AppText>
            ))}
        </View>
    );
}

export default function TarotReadingScreen() {
    const [question, setQuestion] = useState('');
    const [phase, setPhase] = useState<'question' | 'reveal'>('question');
    const [loading, setLoading] = useState(false);
    const [cards, setCards] = useState<DrawnCard[]>([]);
    const [summary, setSummary] = useState<string>('');
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const anims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const runDraw = async () => {
        setLoading(true);
        anims.forEach((a) => a.setValue(0));
        try {
            const result = await api.readings.tarot(question.trim() || undefined);
            const rawCards: any[] = result.cards || [];
            const mapped: DrawnCard[] = rawCards.map((c: any, idx: number) => ({
                nameTR: c.card?.nameTR || c.nameTR || `Kart ${idx + 1}`,
                nameEN: c.card?.nameEN || c.nameEN || '',
                id: c.card?.id ?? null,
                isReversed: c.isReversed || false,
                position: POSITIONS[idx] || `Kart ${idx + 1}`,
                interpretation: c.interpretation || '',
            }));
            const overall =
                typeof result.summary === 'string'
                    ? result.summary
                    : typeof result.overall === 'string'
                      ? result.overall
                      : typeof result.interpretation === 'string'
                        ? result.interpretation
                        : '';
            setCards(mapped);
            setSummary(overall);
            setPhase('reveal');

            const animations = anims.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 650,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(280, animations).start();

            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Tarot okuması yapılamadı');
        } finally {
            setLoading(false);
        }
    };

    const confirmDraw = () => {
        if (credits < TAROT_COST) {
            if (Features.purchasesEnabled) {
                Alert.alert(
                    'Yetersiz Kredi',
                    `Bu okuma için ${TAROT_COST} kredi gerekiyor. Mevcut bakiyeniz: ${credits} kredi.`,
                    [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Kredi Al', onPress: () => router.push('/buy-credits') },
                    ]
                );
            } else {
                // No purchases — guide the user to earn credits for free instead.
                Alert.alert(
                    'Yetersiz Kredi',
                    `Bu okuma için ${TAROT_COST} kredi gerekiyor (mevcut: ${credits}). Krediler ücretsiz kazanılıyor: profildeki günlük ödülünü al, serini sürdür ve seviye atlayarak kredi topla.`
                );
            }
            return;
        }
        Alert.alert(
            '3 Kartlı Okuma',
            `Bu okuma ${TAROT_COST} kredi harcayacak. Devam edilsin mi?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: `${TAROT_COST} Kredi ile Çek`, onPress: runDraw },
            ]
        );
    };

    const reset = () => {
        anims.forEach((a) => a.setValue(0));
        setCards([]);
        setSummary('');
        setQuestion('');
        setPhase('question');
    };

    return (
        <Screen keyboard>
            <Header title="Tarot Okuması" />

            {phase === 'question' ? (
                <View style={styles.section}>
                    <Card glow style={styles.introCard}>
                        <View style={styles.introIcon}>
                            <Ionicons name="albums" size={40} color={Colors.accentYellow} />
                        </View>
                        <AppText variant="h1" center>
                            3 Kartlı Okuma
                        </AppText>
                        <AppText variant="body" center>
                            Geçmiş, Şimdi ve Gelecek için kartlarınızı çekin. Sorunuzu
                            zihninizde tutun veya aşağıya yazın.
                        </AppText>
                        <View style={styles.costPill}>
                            <Ionicons name="diamond" size={14} color={Colors.accentYellow} />
                            <AppText variant="bodyStrong" color={Colors.accentYellow}>
                                {TAROT_COST} kredi
                            </AppText>
                        </View>
                    </Card>

                    <AppText variant="label" style={styles.label}>
                        Sorunuz (isteğe bağlı)
                    </AppText>
                    <TextInput
                        style={styles.input}
                        placeholder="Merak ettiklerinizi yazın..."
                        placeholderTextColor={Colors.textMuted}
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                        editable={!loading}
                    />

                    {loading ? (
                        <LoadingView text="Kartlar çekiliyor... Evren sizin için yorumluyor." />
                    ) : (
                        <Button
                            title="Kartları Çek"
                            onPress={confirmDraw}
                            style={styles.cta}
                            icon={
                                <Ionicons
                                    name="sparkles"
                                    size={18}
                                    color={Colors.textOnAccent}
                                />
                            }
                        />
                    )}
                </View>
            ) : (
                <View style={styles.section}>
                    {question.trim() ? (
                        <Card style={styles.questionEcho}>
                            <AppText variant="label">Sorunuz</AppText>
                            <AppText variant="bodyStrong" color={Colors.purpleLight}>
                                “{question.trim()}”
                            </AppText>
                        </Card>
                    ) : null}

                    <View style={styles.cardsRow}>
                        {cards.map((card, idx) => {
                            const a = anims[idx];
                            const backOpacity = a.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 0, 0],
                            });
                            const frontOpacity = a.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0, 1],
                            });
                            const scale = a.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.9, 1.05, 1],
                            });
                            const rotateY = a.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['180deg', '360deg'],
                            });
                            return (
                                <View key={idx} style={styles.cardColumn}>
                                    <AppText variant="label" center style={styles.posLabel}>
                                        {card.position}
                                    </AppText>
                                    <Animated.View
                                        style={[
                                            styles.cardFrame,
                                            { transform: [{ perspective: 800 }, { rotateY }, { scale }] },
                                        ]}
                                    >
                                        <Animated.Image
                                            source={BACK_IMAGE}
                                            style={[styles.cardImage, { opacity: backOpacity }]}
                                            resizeMode="cover"
                                        />
                                        <Animated.Image
                                            source={
                                                card.id != null
                                                    ? { uri: `${API_HOST}/images/cards/${card.id}.jpeg` }
                                                    : BACK_IMAGE
                                            }
                                            style={[
                                                styles.cardImage,
                                                styles.cardFront,
                                                { opacity: frontOpacity },
                                                card.isReversed && styles.reversed,
                                            ]}
                                            resizeMode="cover"
                                        />
                                    </Animated.View>
                                    <AppText
                                        variant="caption"
                                        center
                                        numberOfLines={2}
                                        color={Colors.textPrimary}
                                        style={styles.cardName}
                                    >
                                        {card.nameTR}
                                    </AppText>
                                    {card.isReversed ? (
                                        <AppText variant="caption" center color={Colors.warning}>
                                            Ters
                                        </AppText>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.readingHeader}>
                        <Ionicons name="sparkles" size={18} color={Colors.accentYellow} />
                        <AppText variant="h2" color={Colors.accentYellow}>
                            Valeria'nın Yorumu
                        </AppText>
                    </View>

                    {cards.map((card, idx) =>
                        card.interpretation ? (
                            <Card key={idx} style={styles.readingCard}>
                                <AppText variant="label" color={Colors.purpleLight}>
                                    {card.position}
                                </AppText>
                                <AppText variant="bodyStrong" style={styles.readingName}>
                                    {card.nameTR}
                                    {card.isReversed ? ' (Ters)' : ''}
                                </AppText>
                                <RichText text={card.interpretation} />
                            </Card>
                        ) : null
                    )}

                    {summary ? (
                        <Card glow style={styles.readingCard}>
                            <AppText variant="label" color={Colors.accentYellow}>
                                Genel Değerlendirme
                            </AppText>
                            <RichText text={summary} />
                        </Card>
                    ) : null}

                    <View style={styles.actions}>
                        <Button title="Yeni Okuma" onPress={reset} />
                        <Button
                            title="Geri Dön"
                            variant="secondary"
                            onPress={() => router.back()}
                        />
                    </View>
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    section: { gap: Spacing.lg },
    introCard: { alignItems: 'center', gap: Spacing.md },
    introIcon: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.goldA12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    costPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.goldA12,
        borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    label: { marginBottom: Spacing.xs, marginLeft: Spacing.xs },
    input: {
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 16,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 96,
        textAlignVertical: 'top',
    },
    cta: { marginTop: Spacing.sm },
    questionEcho: { gap: Spacing.xs },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: CARD_GAP,
        marginVertical: Spacing.md,
    },
    cardColumn: { width: CARD_W, alignItems: 'center', gap: Spacing.xs },
    posLabel: { marginBottom: Spacing.xs },
    cardFrame: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface2,
        borderWidth: 1,
        borderColor: Colors.borderAccent,
        overflow: 'hidden',
        ...Shadows.glowPurple,
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
        width: CARD_W,
        height: CARD_H,
    },
    cardFront: {},
    reversed: { transform: [{ rotate: '180deg' }] },
    cardName: { marginTop: Spacing.xs, minHeight: 32 },
    readingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    readingCard: { gap: Spacing.xs },
    readingName: { marginTop: 2, marginBottom: Spacing.xs },
    richText: { gap: Spacing.md, marginTop: Spacing.xs },
    actions: { gap: Spacing.md, marginTop: Spacing.md },
});
