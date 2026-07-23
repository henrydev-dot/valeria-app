import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, SectionHeader } from '../src/components';
import { useContentStore } from '../src/stores/useContentStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';

export default function LearningCardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const learningCards = useContentStore((s) => s.learningCards);
    const card = learningCards.find((c) => c.id === id);

    if (!card) {
        return (
            <GradientBackground>
                <View style={styles.center}>
                    <Text style={styles.notFound}>Icerik bulunamadi.</Text>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{card.titleTR}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <KismetCard glow style={styles.titleCard}>
                    <Text style={styles.category}>{card.category}</Text>
                    <Text style={styles.title}>{card.titleTR}</Text>
                    <Text style={styles.meta}>{card.readingTime} okuma suresi</Text>
                </KismetCard>

                {card.sections.map((section, idx) => (
                    <KismetCard key={idx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.titleTR}</Text>
                        <Text style={styles.sectionContent}>{section.contentTR}</Text>
                    </KismetCard>
                ))}

                <KismetCard style={styles.disclaimer}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.disclaimerText}>
                        Bu icerik eglence ve kisisel farkindalik amaclidir.
                    </Text>
                </KismetCard>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notFound: {
        color: Colors.textMuted,
        fontSize: FontSize.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingTop: 40,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginHorizontal: Spacing.md,
    },
    titleCard: {
        marginBottom: Spacing.xl,
    },
    category: {
        fontSize: FontSize.xs,
        color: Colors.purpleLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    meta: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.accentYellow,
        marginBottom: Spacing.md,
    },
    sectionContent: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    disclaimerText: {
        flex: 1,
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        lineHeight: 18,
    },
});
