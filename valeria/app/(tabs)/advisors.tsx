import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, SectionHeader } from '../../src/components';
import { useContentStore } from '../../src/stores/useContentStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

export default function AdvisorsScreen() {
    const advisors = useContentStore((s) => s.advisors);

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Danismanlar</Text>
                <Text style={styles.subtitle}>Uzman danismanlarimizdan kisisel rehberlik alin.</Text>

                {advisors.map((advisor) => (
                    <TouchableOpacity
                        key={advisor.id}
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push({ pathname: '/advisor-detail', params: { id: String(advisor.id) } })
                        }
                    >
                        <KismetCard style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.avatar}>
                                    <Ionicons name="person" size={28} color={Colors.purpleLight} />
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.name}>{advisor.name}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color={Colors.accentYellow} />
                                        <Text style={styles.rating}>{advisor.rating}</Text>
                                        <Text style={styles.sessions}>{advisor.sessions} seans</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                            </View>
                            <View style={styles.tags}>
                                {advisor.specialties.map((s) => (
                                    <View key={s} style={styles.tag}>
                                        <Text style={styles.tagText}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.priceRow}>
                                {advisor.packages.map((pkg, idx) => (
                                    <Text key={idx} style={styles.price}>
                                        {pkg.duration}: {pkg.credits} kredi
                                    </Text>
                                ))}
                            </View>
                        </KismetCard>
                    </TouchableOpacity>
                ))}
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
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxl,
    },
    card: {
        marginBottom: Spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.purple + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    rating: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.accentYellow,
    },
    sessions: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginLeft: Spacing.sm,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purple + '20',
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.purpleLight,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    price: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
});
