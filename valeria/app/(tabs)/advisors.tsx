import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, AppText, LoadingView, EmptyState } from '../../src/components';
import { ContentRepository } from '../../src/repositories/ContentRepository';
import { Advisor } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';

export default function AdvisorsScreen() {
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await ContentRepository.getAdvisors();
            setAdvisors(data);
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
            <AppText variant="hero" style={styles.title}>Danışmanlar</AppText>
            <AppText variant="body" style={styles.subtitle}>
                Uzman danışmanlarımızdan kişisel rehberlik alın.
            </AppText>

            {loading && <LoadingView text="Danışmanlar yükleniyor..." />}

            {!loading && error && (
                <EmptyState
                    icon={<Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />}
                    title="Bir sorun oluştu"
                    message="Danışmanlar yüklenemedi. Lütfen tekrar deneyin."
                    actionLabel="Tekrar Dene"
                    onAction={load}
                />
            )}

            {!loading && !error && advisors.length === 0 && (
                <EmptyState
                    icon={<Ionicons name="people-outline" size={48} color={Colors.textMuted} />}
                    title="Henüz danışman yok"
                    message="Yakında uzman danışmanlarımız burada olacak."
                />
            )}

            {!loading && !error && advisors.map((advisor) => (
                <Card
                    key={advisor.id}
                    style={styles.card}
                    accessibilityLabel={`${advisor.name} danışman profili`}
                    onPress={() =>
                        router.push({ pathname: '/advisor-detail', params: { id: String(advisor.id) } })
                    }
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={28} color={Colors.purpleLight} />
                        </View>
                        <View style={styles.info}>
                            <AppText variant="h3">{advisor.name}</AppText>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={Colors.accentYellow} />
                                <AppText variant="callout" color={Colors.accentYellow}>{advisor.rating}</AppText>
                                <AppText variant="caption" style={styles.sessions}>{advisor.sessions} seans</AppText>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    </View>
                    <View style={styles.tags}>
                        {advisor.specialties.map((s) => (
                            <View key={s} style={styles.tag}>
                                <AppText variant="caption" color={Colors.purpleLight}>{s}</AppText>
                            </View>
                        ))}
                    </View>
                    <View style={styles.priceRow}>
                        {advisor.packages.map((pkg, idx) => (
                            <AppText key={idx} variant="caption" color={Colors.textSecondary}>
                                {pkg.duration}: {pkg.credits} kredi
                            </AppText>
                        ))}
                    </View>
                </Card>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: Spacing.sm,
    },
    subtitle: {
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
        backgroundColor: Colors.purpleA25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    info: {
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    sessions: {
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
        backgroundColor: Colors.purpleA15,
    },
    priceRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
});
