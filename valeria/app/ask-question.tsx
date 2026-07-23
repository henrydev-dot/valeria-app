import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, PrimaryButton, SecondaryButton } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';
import * as api from '../src/api';

export default function AskQuestionScreen() {
    const params = useLocalSearchParams<{ q?: string }>();
    const [question, setQuestion] = useState(params.q || '');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const remaining = useEntitlementsStore((s) => s.dailyQuestionsRemaining);
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const handleAsk = async () => {
        if (!question.trim()) return;

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

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Soru Sor</Text>
                    <View style={{ width: 28 }} />
                </View>

                {!answer ? (
                    <View>
                        <KismetCard glow style={styles.infoCard}>
                            <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.purpleLight} />
                            <Text style={styles.infoTitle}>Günlük Soru Hakkı</Text>
                            <Text style={styles.infoDesc}>
                                Bugün {remaining} ücretsiz sorunuz kaldı.
                                {remaining === 0 && ` Ekstra soru için 5 kredi ödenir.`}
                            </Text>
                            {remaining === 0 && (
                                <Text style={styles.creditNote}>
                                    Mevcut bakiye: {credits} kredi
                                </Text>
                            )}
                        </KismetCard>

                        <Text style={styles.label}>Sorunuz</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Merak ettiklerinizi sorun..."
                            placeholderTextColor={Colors.textMuted}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            numberOfLines={4}
                            autoFocus
                        />

                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.accentYellow} style={styles.askBtn} />
                        ) : (
                            <PrimaryButton
                                title={remaining > 0 ? 'Soruyu Gönder' : '5 Kredi ile Sor'}
                                onPress={handleAsk}
                                disabled={!question.trim()}
                                style={styles.askBtn}
                            />
                        )}
                    </View>
                ) : (
                    <View>
                        <KismetCard style={styles.questionCard}>
                            <Text style={styles.questionLabel}>Sorunuz</Text>
                            <Text style={styles.questionText}>"{question}"</Text>
                        </KismetCard>

                        <KismetCard glow style={styles.answerCard}>
                            <Text style={styles.answerLabel}>Kozmik Yanıt</Text>
                            <Text style={styles.answerText}>{answer}</Text>
                        </KismetCard>

                        <View style={styles.actions}>
                            <PrimaryButton
                                title="Yeni Soru Sor"
                                onPress={() => {
                                    setAnswer(null);
                                    setQuestion('');
                                }}
                            />
                            <SecondaryButton
                                title="Geri Dön"
                                onPress={() => router.back()}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    infoCard: {
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    infoTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    infoDesc: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    creditNote: {
        fontSize: FontSize.sm,
        color: Colors.accentYellow,
        fontWeight: '600',
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    askBtn: {
        marginTop: Spacing.xxl,
    },
    questionCard: {
        marginBottom: Spacing.lg,
    },
    questionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    questionText: {
        fontSize: FontSize.md,
        color: Colors.purpleLight,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    answerCard: {
        marginBottom: Spacing.xxl,
    },
    answerLabel: {
        fontSize: FontSize.xs,
        color: Colors.accentYellow,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
    },
    answerText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    actions: {
        gap: Spacing.md,
    },
});
