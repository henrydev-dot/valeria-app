import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, AppText, LoadingView, EmptyState } from '../src/components';
import { UserRepository } from '../src/repositories/UserRepository';
import { DrawnCard } from '../src/types';
import { Colors } from '../src/theme/colors';
import { Spacing } from '../src/theme/spacing';

interface HistoryItem {
    id: string;
    date: string;
    question: string;
    type: 'tarot' | 'coffee';
    cards: DrawnCard[];
}

export default function ReadingHistoryScreen() {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(false);
        try {
            const [tarot, coffee] = await Promise.all([
                UserRepository.getReadingHistory(),
                UserRepository.getCoffeeHistory(),
            ]);
            const merged: HistoryItem[] = [
                ...(tarot || []).map((r) => ({
                    id: r.id,
                    date: r.date,
                    question: r.question,
                    type: 'tarot' as const,
                    cards: r.cards || [],
                })),
                ...(coffee || []).map((r) => ({
                    id: r.id,
                    date: r.date,
                    question: r.question,
                    type: 'coffee' as const,
                    cards: [],
                })),
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setItems(merged);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <Screen>
            <Header title="Geçmiş Okumalar" />

            {loading && <LoadingView text="Geçmiş yükleniyor..." />}

            {!loading && error && (
                <EmptyState
                    icon={<Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />}
                    title="Bir sorun oluştu"
                    message="Geçmiş okumalarınız yüklenemedi."
                    actionLabel="Tekrar Dene"
                    onAction={load}
                />
            )}

            {!loading && !error && items.length === 0 && (
                <EmptyState
                    icon={<Ionicons name="time-outline" size={48} color={Colors.textMuted} />}
                    title="Henüz bir okumanız yok"
                    message="Tarot veya kahve falı okuması yaptığınızda burada görünecek."
                    actionLabel="Okuma Yap"
                    onAction={() => router.back()}
                />
            )}

            {!loading && !error && items.map((item) => (
                <Card key={item.id} style={styles.card}>
                    <View style={styles.row}>
                        <Ionicons
                            name={item.type === 'tarot' ? 'layers-outline' : 'cafe-outline'}
                            size={24}
                            color={item.type === 'tarot' ? Colors.accentYellow : Colors.purpleLight}
                        />
                        <View style={styles.content}>
                            <AppText variant="bodyStrong">
                                {item.type === 'tarot' ? 'Tarot Okuması' : 'Kahve Falı'}
                            </AppText>
                            <AppText variant="caption" style={styles.date}>
                                {new Date(item.date).toLocaleDateString('tr-TR', {
                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </AppText>
                            {item.question ? (
                                <AppText variant="callout" color={Colors.purpleLight} style={styles.question} numberOfLines={2}>
                                    "{item.question}"
                                </AppText>
                            ) : null}
                            {item.type === 'tarot' && item.cards.length > 0 ? (
                                <AppText variant="caption" color={Colors.accentYellow} style={styles.cards}>
                                    {item.cards.map((c) => c.card?.nameTR || '').filter(Boolean).join(' · ')}
                                </AppText>
                            ) : null}
                        </View>
                    </View>
                </Card>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    content: {
        flex: 1,
    },
    date: {
        marginTop: 2,
    },
    question: {
        fontStyle: 'italic',
        marginTop: Spacing.xs,
    },
    cards: {
        marginTop: Spacing.xs,
    },
});
