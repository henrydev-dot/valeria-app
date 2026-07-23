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
            Alert.alert(
                'Yetersiz Kredi',
                `Ek soru için ${QUESTION_COST} kredi gerekiyor. Mevcut bakiyeniz: ${credits} kredi.`,
                [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Kredi Al', onPress: () => router.push('/buy-credits') },
                ]
            );
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

    return (
        <Screen keyboard>
            <Header title="Soru Sor" />

            {!answer ? (
                <View style={styles.section}>
                    <Card glow style={styles.introCard}>
                        <View style={styles.introIcon}>
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={36}
                                color={Colors.accentYellow}
                            />
                        </View>
                        <AppText variant="h1" center>
                            Kozmik Soru
                        </AppText>
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
                        placeholder="Merak ettiklerinizi sorun..."
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
