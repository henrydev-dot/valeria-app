import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, AppText, LoadingView, EmptyState } from '../src/components';
import { ContentRepository } from '../src/repositories/ContentRepository';
import { LearningCard } from '../src/types';
import { Colors } from '../src/theme/colors';
import { Spacing } from '../src/theme/spacing';

export default function LearningCardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [card, setCard] = useState<LearningCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(false);
        try {
            const all = await ContentRepository.getLearningCards();
            setCard(all.find((c) => c.id === id) || null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    if (loading) {
        return (
            <Screen>
                <Header title="İçerik" />
                <LoadingView text="İçerik yükleniyor..." />
            </Screen>
        );
    }

    if (error || !card) {
        return (
            <Screen>
                <Header title="İçerik" />
                <EmptyState
                    icon={<Ionicons name="document-outline" size={48} color={Colors.textMuted} />}
                    title="İçerik bulunamadı"
                    message={error ? 'İçerik yüklenemedi. Lütfen tekrar deneyin.' : 'Bu içerik artık mevcut değil.'}
                    actionLabel={error ? 'Tekrar Dene' : undefined}
                    onAction={error ? load : undefined}
                />
            </Screen>
        );
    }

    return (
        <Screen>
            <Header title={card.titleTR} />

            <Card glow style={styles.titleCard}>
                <AppText variant="label" color={Colors.purpleLight}>{card.category}</AppText>
                <AppText variant="title" style={styles.title}>{card.titleTR}</AppText>
                <AppText variant="caption">{card.readingTime} okuma süresi</AppText>
            </Card>

            {card.sections.map((section, idx) => (
                <Card key={idx} style={styles.section}>
                    <AppText variant="h3" color={Colors.accentYellow} style={styles.sectionTitle}>
                        {section.titleTR}
                    </AppText>
                    <AppText variant="body">{section.contentTR}</AppText>
                </Card>
            ))}

            <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <AppText variant="caption" style={styles.disclaimerText}>
                    Bu içerik eğlence ve kişisel farkındalık amaçlıdır.
                </AppText>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    titleCard: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    title: {
        marginTop: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    disclaimerText: {
        flex: 1,
    },
});
