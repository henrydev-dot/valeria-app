import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button, AppText, LoadingView, EmptyState } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { ContentRepository } from '../src/repositories/ContentRepository';
import { Advisor } from '../src/types';
import * as api from '../src/api';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

type Pkg = { duration: string; credits: number };

export default function AdvisorDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const spendCredits = useEntitlementsStore((s) => s.spendCredits);

    const [advisor, setAdvisor] = useState<Advisor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Session / request state
    const [activePackage, setActivePackage] = useState<Pkg | null>(null);
    const [starting, setStarting] = useState<number | null>(null);
    const [question, setQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(false);
        try {
            const all = await ContentRepository.getAdvisors();
            const found = all.find((a) => String(a.id) === id) || null;
            setAdvisor(found);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    const confirmStart = (pkg: Pkg, idx: number) => {
        if (!advisor) return;
        Alert.alert(
            'Seansı Başlat',
            `${advisor.name} ile ${pkg.duration} seans için ${pkg.credits} kredi harcanacak. Devam edilsin mi?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Onayla', onPress: () => startSession(pkg, idx) },
            ]
        );
    };

    const startSession = async (pkg: Pkg, idx: number) => {
        // spendCredits is async → it MUST be awaited; a bare Promise is always truthy.
        setStarting(idx);
        const ok = await spendCredits(pkg.credits, 'advisor_session', `advisor_${advisor?.id}`);
        setStarting(null);
        if (!ok) {
            Alert.alert('Yetersiz Kredi', `Bu seans için ${pkg.credits} kredi gerekiyor.`);
            return;
        }
        setActivePackage(pkg);
        setSubmitted(false);
        setQuestion('');
    };

    const submitRequest = async () => {
        if (!advisor || !question.trim()) return;
        setSubmitting(true);
        try {
            await api.readings.advisorRequest(String(advisor.id), 'advisor_session', question.trim());
            setSubmitted(true);
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Screen>
                <Header title="Danışman" />
                <LoadingView text="Danışman yükleniyor..." />
            </Screen>
        );
    }

    if (error || !advisor) {
        return (
            <Screen>
                <Header title="Danışman" />
                <EmptyState
                    icon={<Ionicons name="person-remove-outline" size={48} color={Colors.textMuted} />}
                    title="Danışman bulunamadı"
                    message={error ? 'İçerik yüklenemedi. Lütfen tekrar deneyin.' : 'Bu danışman artık mevcut değil.'}
                    actionLabel={error ? 'Tekrar Dene' : undefined}
                    onAction={error ? load : undefined}
                />
            </Screen>
        );
    }

    // ── Active session: async advisor-request flow (no fake instant reply) ──
    if (activePackage) {
        return (
            <Screen keyboard>
                <Header title={advisor.name} onBack={() => setActivePackage(null)} />

                <Card glow style={styles.sessionBanner}>
                    <Ionicons name="hourglass-outline" size={22} color={Colors.accentYellow} />
                    <AppText variant="callout" style={styles.sessionBannerText}>
                        {advisor.name} ile {activePackage.duration} seansınız aktif.
                    </AppText>
                </Card>

                {submitted ? (
                    <Card style={styles.section}>
                        <View style={styles.submittedIcon}>
                            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                        </View>
                        <AppText variant="h2" center>Talebiniz alındı</AppText>
                        <AppText variant="body" center style={styles.submittedText}>
                            Sorunuz {advisor.name} adlı danışmana iletildi. Yanıt hazır olduğunda size bildirim
                            gönderilecek ve okuma geçmişinizde görüntülenecektir.
                        </AppText>
                        <Button title="Bitir" onPress={() => setActivePackage(null)} style={styles.finishBtn} />
                    </Card>
                ) : (
                    <Card style={styles.section}>
                        <AppText variant="h3" style={styles.sectionTitle}>Sorunuzu yazın</AppText>
                        <AppText variant="caption" style={styles.helperText}>
                            Danışman sorunuzu inceleyip yanıtını hazırlayacaktır. Yanıt anında gelmez.
                        </AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Danışmana sormak istediğinizi yazın..."
                            placeholderTextColor={Colors.textMuted}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            textAlignVertical="top"
                            accessibilityLabel="Danışmana sorunuz"
                        />
                        <Button
                            title="Danışmana Gönder"
                            onPress={submitRequest}
                            loading={submitting}
                            disabled={!question.trim()}
                            icon={<Ionicons name="send" size={16} color={Colors.textOnAccent} />}
                            style={styles.submitBtn}
                        />
                    </Card>
                )}
            </Screen>
        );
    }

    // ── Advisor profile ──
    return (
        <Screen>
            <Header title={advisor.name} />

            <Card glow style={styles.profileCard}>
                <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={40} color={Colors.purpleLight} />
                </View>
                <AppText variant="title" center>{advisor.name}</AppText>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color={Colors.accentYellow} />
                    <AppText variant="bodyStrong" color={Colors.accentYellow}>{advisor.rating}</AppText>
                    <AppText variant="caption" style={styles.sessions}>{advisor.sessions} seans tamamlandı</AppText>
                </View>
                <View style={styles.tags}>
                    {advisor.specialties.map((s) => (
                        <View key={s} style={styles.tag}>
                            <AppText variant="caption" color={Colors.purpleLight}>{s}</AppText>
                        </View>
                    ))}
                </View>
            </Card>

            <Card style={styles.section}>
                <AppText variant="h3" style={styles.sectionTitle}>Hakkında</AppText>
                <AppText variant="body">{advisor.bio}</AppText>
            </Card>

            <Card style={styles.section}>
                <AppText variant="h3" style={styles.sectionTitle}>Seans Paketleri</AppText>
                {advisor.packages.map((pkg, idx) => (
                    <View
                        key={idx}
                        style={[styles.packageRow, idx === advisor.packages.length - 1 && styles.packageRowLast]}
                    >
                        <View>
                            <AppText variant="bodyStrong">{pkg.duration}</AppText>
                            <AppText variant="callout" color={Colors.accentYellow}>{pkg.credits} kredi</AppText>
                        </View>
                        <Button
                            title="Danış"
                            size="sm"
                            fullWidth={false}
                            loading={starting === idx}
                            disabled={starting !== null && starting !== idx}
                            onPress={() => confirmStart(pkg, idx)}
                        />
                    </View>
                ))}
            </Card>

            <Card style={styles.section}>
                <AppText variant="h3" style={styles.sectionTitle}>Yorumlar</AppText>
                {advisor.reviews.map((r, idx) => (
                    <View
                        key={idx}
                        style={[styles.review, idx === advisor.reviews.length - 1 && styles.reviewLast]}
                    >
                        <View style={styles.reviewHeader}>
                            <AppText variant="bodyStrong">{r.user}</AppText>
                            <View style={styles.reviewStars}>
                                {Array.from({ length: r.rating }).map((_, i) => (
                                    <Ionicons key={i} name="star" size={12} color={Colors.accentYellow} />
                                ))}
                            </View>
                        </View>
                        <AppText variant="callout">{r.text}</AppText>
                    </View>
                ))}
            </Card>
        </Screen>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.purpleA25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.xs,
        marginBottom: Spacing.md,
    },
    sessions: {
        marginLeft: Spacing.sm,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        justifyContent: 'center',
    },
    tag: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purpleA15,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    packageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    packageRowLast: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    review: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    reviewLast: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    // Session
    sessionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    sessionBannerText: {
        flex: 1,
    },
    helperText: {
        marginBottom: Spacing.md,
    },
    input: {
        minHeight: 120,
        backgroundColor: Colors.surface2,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: 15,
        lineHeight: 22,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    submitBtn: {
        marginTop: Spacing.lg,
    },
    submittedIcon: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    submittedText: {
        marginTop: Spacing.sm,
    },
    finishBtn: {
        marginTop: Spacing.xl,
    },
});
