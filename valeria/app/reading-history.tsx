import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard } from '../src/components';
import { useContentStore } from '../src/stores/useContentStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing } from '../src/theme/spacing';

export default function ReadingHistoryScreen() {
    const readingHistory = useContentStore((s) => s.readingHistory);
    const coffeeHistory = useContentStore((s) => s.coffeeHistory);

    const all = [
        ...readingHistory.map((r) => ({ ...r, type: 'tarot' as const })),
        ...coffeeHistory.map((r) => ({
            id: r.id,
            date: r.date,
            question: r.question,
            type: 'coffee' as const,
            cards: [],
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Gecmis Okumalar</Text>
                    <View style={{ width: 24 }} />
                </View>

                {all.length === 0 && (
                    <KismetCard style={styles.empty}>
                        <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>Henuz bir okumaniz yok.</Text>
                    </KismetCard>
                )}

                {all.map((item) => (
                    <KismetCard key={item.id} style={styles.card}>
                        <View style={styles.row}>
                            <Ionicons
                                name={item.type === 'tarot' ? 'layers-outline' : 'cafe-outline'}
                                size={24}
                                color={item.type === 'tarot' ? Colors.accentYellow : Colors.purpleLight}
                            />
                            <View style={styles.content}>
                                <Text style={styles.type}>
                                    {item.type === 'tarot' ? 'Tarot Okuması' : 'Kahve Falı'}
                                </Text>
                                <Text style={styles.date}>
                                    {new Date(item.date).toLocaleDateString('tr-TR', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                    })}
                                </Text>
                                {item.question && (
                                    <Text style={styles.question} numberOfLines={2}>
                                        "{item.question}"
                                    </Text>
                                )}
                                {item.type === 'tarot' && item.cards && (
                                    <Text style={styles.cards}>
                                        {item.cards.map((c: any) => c.card?.nameTR || '').join(' | ')}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </KismetCard>
                ))}
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
    empty: {
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.huge,
    },
    emptyText: {
        fontSize: FontSize.md,
        color: Colors.textMuted,
    },
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
    type: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    date: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    question: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        fontStyle: 'italic',
        marginTop: Spacing.xs,
    },
    cards: {
        fontSize: FontSize.xs,
        color: Colors.accentYellow,
        marginTop: Spacing.xs,
    },
});
