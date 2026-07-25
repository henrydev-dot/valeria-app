import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, AppText, Button, Card, LoadingView } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { useUserStore } from '../src/stores/useUserStore';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';
import * as api from '../src/api';
import { Features } from '../src/config';

const QUESTION_COST = 150;

export default function AskQuestionScreen() {
    const params = useLocalSearchParams<{ q?: string }>();
    const [question, setQuestion] = useState(params.q || '');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const remaining = useEntitlementsStore((s) => s.dailyQuestionsRemaining);
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const membershipType = useUserStore((s) => s.profile.membershipType);

    const isPremium = !!membershipType && membershipType !== 'free';
    const isFree = remaining > 0;
    const canAfford = isFree || credits >= QUESTION_COST;

    const doAsk = async () => {
        setLoading(true);
        try {
            const result = await api.readings.question(question.trim());
            setAnswer(result.answer || 'Yıldızlar şu an sessiz...');
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Soru gönderilemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAsk = () => {
        if (!question.trim()) return;
        if (!isFree && credits < QUESTION_COST) {
            if (Features.purchasesEnabled) {
                Alert.alert(
                    'Yetersiz Kredi',
                    `Ek soru için ${QUESTION_COST} kredi gerekiyor. Mevcut bakiyeniz: ${credits} kredi.`,
                    [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Kredi Al', onPress: () => router.push('/buy-credits') },
                    ]
                );
            } else {
                // No purchases — guide the user to earn credits for free instead.
                Alert.alert(
                    'Yetersiz Kredi',
                    `Ek soru için ${QUESTION_COST} kredi gerekiyor (mevcut: ${credits}). Yarın yeni ücretsiz soru hakkın açılır; ayrıca profildeki günlük ödülünü alarak, serini sürdürerek ve seviye atlayarak kredi kazanabilirsin.`
                );
            }
            return;
        }
        if (!isFree) {
            Alert.alert(
                'Ek Soru',
                `Bu soru ${QUESTION_COST} kredi harcayacak. Devam edilsin mi?`,
                [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: `${QUESTION_COST} Kredi ile Sor`, onPress: doAsk },
                ]
            );
            return;
        }
        doAsk();
    };

    const profile = useUserStore((s) => s.profile);
    const natalChips = [
        profile.sunSign ? `☉ ${profile.sunSign}` : null,
        profile.moonSign ? `☽ ${profile.moonSign}` : null,
        profile.risingSign ? `↑ ${profile.risingSign}` : null,
        profile.element ? `◆ ${profile.element}` : null,
    ].filter(Boolean) as string[];

    return (
        <Screen keyboard>
            <Header title="Yıldızlara Sor" />

            {!answer ? (
                <View style={styles.section}>
                    <Card glow style={styles.introCard}>
                        <View style={styles.introIcon}>
                            <Ionicons
                                name="telescope-outline"
                                size={36}
                                color={Colors.accentYellow}
                            />
                        </View>
                        <View style={styles.horaryTag}>
                            <AppText variant="label" color={Colors.purpleLight}>HORARY ASTROLOJİ</AppText>
                        </View>
                        <AppText variant="h1" center>
                            Yıldızlara Sor
                        </AppText>
                        <AppText variant="callout" center color={Colors.textSecondary}>
                            Sorunu yaz; Valeria doğum haritanı — burcunu, yükselenini, evlerini —
                            ve şu anki gökyüzünü birlikte okuyarak sana özel net bir yanıt versin.
                        </AppText>
                        {natalChips.length > 0 && (
                            <View style={styles.natalChips}>
                                {natalChips.map((c) => (
                                    <View key={c} style={styles.natalChip}>
                                        <AppText variant="caption" color={Colors.textPrimary}>{c}</AppText>
                                    </View>
                                ))}
                            </View>
                        )}
                        {isFree ? (
                            <>
                                <AppText variant="body" center>
                                    Bugün {remaining} ücretsiz sorunuz kaldı.
                                </AppText>
                                <View style={styles.freePill}>
                                    <Ionicons name="gift" size={14} color={Colors.success} />
                                    <AppText variant="bodyStrong" color={Colors.success}>
                                        Ücretsiz
                                    </AppText>
                                </View>
                            </>
                        ) : (
                            <>
                                <AppText variant="body" center>
                                    Bugünkü ücretsiz sorularınız doldu. Ek soru için{' '}
                                    {QUESTION_COST} kredi harcanır.
                                </AppText>
                                <View style={styles.costPill}>
                                    <Ionicons name="diamond" size={14} color={Colors.accentYellow} />
                                    <AppText variant="bodyStrong" color={Colors.accentYellow}>
                                        {QUESTION_COST} kredi
                                    </AppText>
                                </View>
                                <AppText variant="caption" center>
                                    Mevcut bakiye: {credits} kredi
                                </AppText>
                            </>
                        )}
                        <AppText variant="caption" center>
                            {isPremium
                                ? 'Premium üyelere günde 2 ücretsiz soru hakkı tanınır.'
                                : 'Her gün ilk sorunuz ücretsizdir.'}
                        </AppText>
                    </Card>

                    <AppText variant="label" style={styles.label}>
                        Sorunuz
                    </AppText>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Bu ay kariyerimde beklediğim gelişme olacak mı?"
                        placeholderTextColor={Colors.textMuted}
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                        editable={!loading}
                    />

                    {loading ? (
                        <LoadingView text="Yıldızlar yanıtınızı hazırlıyor..." />
                    ) : (
                        <Button
                            title={isFree ? 'Soruyu Gönder' : `${QUESTION_COST} Kredi ile Sor`}
                            onPress={handleAsk}
                            disabled={!question.trim() || !canAfford}
                            style={styles.cta}
                            icon={
                                <Ionicons name="send" size={16} color={Colors.textOnAccent} />
                            }
                        />
                    )}
                </View>
            ) : (
                <View style={styles.section}>
                    <Card style={styles.questionCard}>
                        <AppText variant="label">Sorunuz</AppText>
                        <AppText variant="bodyStrong" color={Colors.purpleLight}>
                            “{question.trim()}”
                        </AppText>
                    </Card>

                    <Card glow style={styles.answerCard}>
                        <View style={styles.answerHeader}>
                            <Ionicons name="sparkles" size={18} color={Colors.accentYellow} />
                            <AppText variant="label" color={Colors.accentYellow}>
                                Kozmik Yanıt
                            </AppText>
                        </View>
                        <AppText variant="body">{answer}</AppText>
                    </Card>

                    <View style={styles.actions}>
                        <Button
                            title="Yeni Soru Sor"
                            onPress={() => {
                                setAnswer(null);
                                setQuestion('');
                            }}
                        />
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
    introCard: { alignItems: 'center', gap: Spacing.sm },
    horaryTag: {
        backgroundColor: Colors.purpleA15,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.purpleA25,
    },
    natalChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },
    natalChip: {
        backgroundColor: Colors.whiteA08,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    introIcon: {
        width: 68,
        height: 68,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.goldA12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    freePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.whiteA08,
        borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
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
        minHeight: 110,
        textAlignVertical: 'top',
    },
    cta: { marginTop: Spacing.sm },
    questionCard: { gap: Spacing.xs },
    answerCard: { gap: Spacing.sm },
    answerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    actions: { gap: Spacing.md, marginTop: Spacing.sm },
});
