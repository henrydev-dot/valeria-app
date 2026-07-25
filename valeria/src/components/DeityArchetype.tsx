import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { AppText } from './AppText';
import { Card } from './Card';
import { useUserStore } from '../stores/useUserStore';
import { ContentRepository } from '../repositories/ContentRepository';
import type { Deity } from '../types';

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
        <Card
            onPress={() => setExpanded(!expanded)}
            accessibilityLabel={`Arketipin ${deity.nameTR}. ${expanded ? 'Detayları gizle' : 'Detayları göster'}`}
            padded={false}
        >
            {/* Compact header — always visible */}
            <View style={styles.card}>
                <Image source={deityImage} style={styles.avatar} resizeMode="cover" />
                <View style={styles.info}>
                    <AppText variant="label" color={Colors.accentYellow}>Arketipin</AppText>
                    <AppText variant="h3">{deity.nameTR}</AppText>
                    <AppText variant="caption" color={Colors.textMuted}>{deity.titleTR}</AppText>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textMuted}
                />
            </View>

            {/* Expanded Details */}
            {expanded && (
                <View style={styles.details}>
                    <AppText variant="body" style={styles.description}>{deity.descriptionTR}</AppText>

                    {/* Strengths */}
                    <View style={styles.traitSection}>
                        <View style={styles.traitHeader}>
                            <Ionicons name="star" size={14} color={Colors.accentYellow} />
                            <AppText variant="bodyStrong">Güçlü Yönler</AppText>
                        </View>
                        <View style={styles.traitList}>
                            {deity.strengthsTR.map((s, i) => (
                                <View key={i} style={styles.traitBadge}>
                                    <AppText variant="caption" color={Colors.accentYellow}>{s}</AppText>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Growth areas */}
                    <View style={styles.traitSection}>
                        <View style={styles.traitHeader}>
                            <Ionicons name="trending-up" size={14} color={Colors.purpleLight} />
                            <AppText variant="bodyStrong">Gelişim Alanları</AppText>
                        </View>
                        <View style={styles.traitList}>
                            {deity.growthTR.map((s, i) => (
                                <View key={i} style={[styles.traitBadge, styles.growthBadge]}>
                                    <AppText variant="caption" color={Colors.purpleLight}>{s}</AppText>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
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
        gap: 2,
    },
    details: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        paddingTop: Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: -Spacing.xs,
    },
    description: {
        lineHeight: 22,
        marginTop: Spacing.md,
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
    traitList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    traitBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.goldA12,
        borderWidth: 1,
        borderColor: Colors.borderAccent,
    },
    growthBadge: {
        backgroundColor: Colors.purpleA15,
        borderColor: Colors.purpleA25,
    },
});
