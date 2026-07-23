import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { FontSize, Spacing, BorderRadius } from '../theme/spacing';
import { useUserStore } from '../stores/useUserStore';
import { ContentRepository } from '../repositories/ContentRepository';
import type { Deity } from '../types';

const { width } = Dimensions.get('window');

import { API_HOST } from '../api';
const DEITY_IMAGES: Record<string, any> = {
    athena: { uri: `${API_HOST}/images/gods/athena.jpeg` },
    artemis: { uri: `${API_HOST}/images/gods/Artemis.jpeg` },
    hera: { uri: `${API_HOST}/images/gods/Hera.jpeg` },
    aphrodite: { uri: `${API_HOST}/images/gods/Aphrodite.jpeg` },
    demeter: { uri: `${API_HOST}/images/gods/demeter.jpeg` },
    zeus: { uri: `${API_HOST}/images/gods/zeus.jpeg` },
    apollo: { uri: `${API_HOST}/images/gods/Apollo.jpeg` },
    ares: { uri: `${API_HOST}/images/gods/ares.jpeg` },
    poseidon: { uri: `${API_HOST}/images/gods/posedion.jpeg` },
    hermes: { uri: `${API_HOST}/images/gods/hermes.jpeg` },
    persephone: { uri: `${API_HOST}/images/gods/hestia.jpeg` },
    hades: { uri: `${API_HOST}/images/gods/Hephaestus.jpeg` },
    prometheus: { uri: `${API_HOST}/images/gods/zeus.jpeg` },
    kronos: { uri: `${API_HOST}/images/gods/Hephaestus.jpeg` },
};

export function DeityArchetype() {
    const profile = useUserStore((s) => s.profile);
    const [deity, setDeity] = useState<Deity | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadDeity();
    }, [profile.deityResult]);

    const loadDeity = async () => {
        const data = await ContentRepository.getOnboardingTest();
        const found = (data.deities as Deity[]).find((d) => d.id === profile.deityResult);
        if (found) setDeity(found);
    };

    if (!deity) return null;

    const deityImage = DEITY_IMAGES[deity.id];

    return (
        <View style={styles.container}>
            {/* Compact Card — always visible */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.85}
            >
                {/* Deity Image */}
                <Image
                    source={deityImage}
                    style={styles.avatar}
                    resizeMode="cover"
                />
                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.label}>Arketipiniz</Text>
                    <Text style={styles.name}>{deity.nameTR}</Text>
                    <Text style={styles.title}>{deity.titleTR}</Text>
                </View>
                {/* Chevron */}
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textMuted}
                />
            </TouchableOpacity>

            {/* Expanded Details */}
            {expanded && (
                <View style={styles.details}>
                    {/* Description */}
                    <Text style={styles.description}>{deity.descriptionTR}</Text>

                    {/* Strengths */}
                    <View style={styles.traitSection}>
                        <View style={styles.traitHeader}>
                            <Ionicons name="star" size={14} color={Colors.accentYellow} />
                            <Text style={styles.traitTitle}>Guclu Yonler</Text>
                        </View>
                        <View style={styles.traitList}>
                            {deity.strengthsTR.map((s, i) => (
                                <View key={i} style={styles.traitBadge}>
                                    <Text style={styles.traitText}>{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Growth areas */}
                    <View style={styles.traitSection}>
                        <View style={styles.traitHeader}>
                            <Ionicons name="trending-up" size={14} color={Colors.purpleLight} />
                            <Text style={styles.traitTitle}>Gelisim Alanlari</Text>
                        </View>
                        <View style={styles.traitList}>
                            {deity.growthTR.map((s, i) => (
                                <View key={i} style={[styles.traitBadge, styles.growthBadge]}>
                                    <Text style={[styles.traitText, styles.growthText]}>{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: Colors.accentYellow,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.accentYellow,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    name: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    title: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 1,
    },
    details: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderTopWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginTop: -BorderRadius.lg,
        paddingTop: BorderRadius.lg + Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    description: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    traitSection: {
        marginBottom: Spacing.md,
    },
    traitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    traitTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    traitList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    traitBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.accentYellow + '15',
        borderWidth: 1,
        borderColor: Colors.accentYellow + '30',
    },
    traitText: {
        fontSize: FontSize.xs,
        fontWeight: '500',
        color: Colors.accentYellow,
    },
    growthBadge: {
        backgroundColor: Colors.purple + '15',
        borderColor: Colors.purple + '30',
    },
    growthText: {
        color: Colors.purpleLight,
    },
});
