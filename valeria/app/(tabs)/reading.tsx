import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    Screen, AppText, Button, Card, EmptyState, LoadingView, Skeleton,
} from '../../src/components';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { ContentRepository } from '../../src/repositories/ContentRepository';
import { Advisor } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../../src/theme/spacing';
import * as api from '../../src/api';

type ReadingType = 'tarot' | 'kahve' | 'sarkac';

interface ReadingTypeDef {
    key: ReadingType;
    name: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    /** Credit cost of the Valeria (AI) reading. 0 = free/local. */
    cost: number;
    route: string;
    /** Whether this type can be handed to a human advisor. */
    usesAdvisor: boolean;
}

const READING_TYPES: ReadingTypeDef[] = [
    {
        key: 'tarot',
        name: 'Tarot Okuması',
        description: 'Geçmiş, şimdi ve gelecek için üç kart çek.',
        icon: 'albums',
        color: Colors.accentYellow,
        cost: 30,
        route: '/tarot-reading',
        usesAdvisor: true,
    },
    {
        key: 'kahve',
        name: 'Kahve Falı',
        description: 'Fincanındaki sembolleri Valeria yorumlasın.',
        icon: 'cafe',
        color: Colors.purpleLight,
        cost: 20,
        route: '/coffee-reading',
        usesAdvisor: true,
    },
    {
        key: 'sarkac',
        name: 'Sarkaç',
        description: 'Evet/hayır sorularına anında yanıt al.',
        icon: 'navigate',
        color: Colors.info,
        cost: 0,
        route: '/pendulum',
        usesAdvisor: false,
    },
];

/** Backend deducts this many credits per human-advisor request. */
const ADVISOR_REQUEST_COST = 10;

const VALERIA_ID = 'valeria';

interface RosterAdvisor {
    id: string;
    name: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    isAI: boolean;
}

const VALERIA: RosterAdvisor = {
    id: VALERIA_ID,
    name: 'Valeria',
    subtitle: 'Yapay Zekâ Rehber • Anında',
    icon: 'sparkles',
    color: Colors.accentYellow,
    isAI: true,
};

export default function ReadingScreen() {
    const [activeType, setActiveType] = useState<ReadingType>('tarot');
    const [selectedAdvisor, setSelectedAdvisor] = useState<string>(VALERIA_ID);
    const [question, setQuestion] = useState('');
    const [sending, setSending] = useState(false);

    const [humanAdvisors, setHumanAdvisors] = useState<RosterAdvisor[]>([]);
    const [advisorsLoading, setAdvisorsLoading] = useState(true);

    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);

    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const activeDef = READING_TYPES.find((t) => t.key === activeType)!;
    const roster: RosterAdvisor[] = [VALERIA, ...humanAdvisors];
    const selectedAdv = roster.find((a) => a.id === selectedAdvisor) ?? VALERIA;
    const isAI = selectedAdv.isAI;

    // Load the human advisor roster from the single content source.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await ContentRepository.getAdvisors();
                if (!active) return;
                setHumanAdvisors(
                    (data as Advisor[]).map((a) => ({
                        id: String(a.id),
                        name: a.name,
                        subtitle: a.specialties.slice(0, 2).join(' • '),
                        icon: 'person-circle' as const,
                        color: Colors.purpleLight,
                        isAI: false,
                    }))
                );
            } catch {
                if (active) setHumanAdvisors([]);
            } finally {
                if (active) setAdvisorsLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Load pending requests every time the screen comes into focus.
    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const loadRequests = async () => {
        try {
            const reqs = await api.readings.advisorRequests();
            setPendingRequests(reqs);
        } catch {
            // Swallow — surfaced via the empty state below.
        } finally {
            setRequestsLoading(false);
        }
    };

    const selectType = (type: ReadingType) => {
        setActiveType(type);
        const def = READING_TYPES.find((t) => t.key === type)!;
        // Reset to Valeria when switching to a type that has no advisor flow.
        if (!def.usesAdvisor) setSelectedAdvisor(VALERIA_ID);
    };

    const startValeriaReading = () => {
        router.push(activeDef.route as any);
    };

    const handleAdvisorAction = async () => {
        // Kahve requires 4 cup photos — hand off to the dedicated screen that
        // collects them and submits the advisor request there.
        if (activeType === 'kahve') {
            router.push({
                pathname: '/coffee-reading',
                params: { advisorId: selectedAdv.id },
            } as any);
            return;
        }

        if (!question.trim()) {
            Alert.alert('Soru Gerekli', 'Lütfen falcıya sormak istediğiniz soruyu yazın.');
            return;
        }
        setSending(true);
        try {
            await api.readings.advisorRequest(selectedAdv.id, activeType, question.trim());
            await refreshEnt();
            Alert.alert(
                'Fal İsteği Gönderildi',
                `${selectedAdv.name} falınızı en kısa sürede okuyacak. Hazır olduğunda bildirim alacaksınız.`,
                [{ text: 'Tamam' }]
            );
            setQuestion('');
            await loadRequests();
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Fal isteği gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status: string) =>
        status === 'answered' ? Colors.success : Colors.warning;
    const getStatusText = (status: string) =>
        status === 'answered' ? 'Cevaplandı' : 'Beklemede';
    const getAdvisorName = (id: string) =>
        roster.find((a) => a.id === id)?.name ?? 'Falcı';

    const costLabel = (cost: number) => (cost === 0 ? 'Ücretsiz' : `${cost} kredi`);

    return (
        <Screen keyboard>
            <AppText variant="hero" style={styles.heading}>Fal</AppText>
            <AppText variant="body" style={styles.subheading}>
                Sana nasıl yol gösterelim? Bir fal türü seç.
            </AppText>

            {/* Reading type entry tiles */}
            <View style={styles.tiles}>
                {READING_TYPES.map((t) => {
                    const isActive = activeType === t.key;
                    return (
                        <Card
                            key={t.key}
                            onPress={() => selectType(t.key)}
                            accessibilityLabel={`${t.name}, ${costLabel(t.cost)}`}
                            style={[styles.tile, isActive && { borderColor: t.color }]}
                        >
                            <View style={styles.tileRow}>
                                <View style={[styles.tileIcon, { backgroundColor: t.color + '20' }]}>
                                    <Ionicons name={t.icon} size={26} color={t.color} />
                                </View>
                                <View style={styles.tileText}>
                                    <AppText variant="h3">{t.name}</AppText>
                                    <AppText variant="caption" numberOfLines={1}>
                                        {t.description}
                                    </AppText>
                                </View>
                                <View style={styles.tileMeta}>
                                    <View
                                        style={[
                                            styles.costBadge,
                                            t.cost === 0 && styles.costBadgeFree,
                                        ]}
                                    >
                                        <AppText
                                            variant="caption"
                                            color={t.cost === 0 ? Colors.success : Colors.accentYellow}
                                            style={styles.costText}
                                        >
                                            {costLabel(t.cost)}
                                        </AppText>
                                    </View>
                                    <Ionicons
                                        name={isActive ? 'chevron-down' : 'chevron-forward'}
                                        size={18}
                                        color={Colors.textMuted}
                                    />
                                </View>
                            </View>
                        </Card>
                    );
                })}
            </View>

            {/* Detail / action panel for the selected type */}
            {activeDef.usesAdvisor ? (
                <View style={styles.panel}>
                    <AppText variant="label" style={styles.panelLabel}>Kim baksın?</AppText>

                    {advisorsLoading ? (
                        <View style={styles.advisorRow}>
                            {[0, 1, 2].map((i) => (
                                <Skeleton key={i} width={132} height={116} radius={BorderRadius.lg} style={styles.advisorSkeleton} />
                            ))}
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.advisorRow}
                        >
                            {roster.map((adv) => {
                                const active = selectedAdvisor === adv.id;
                                return (
                                    <Card
                                        key={adv.id}
                                        onPress={() => setSelectedAdvisor(adv.id)}
                                        padded={false}
                                        accessibilityLabel={`${adv.name}, ${adv.subtitle}`}
                                        style={[styles.advisorCard, active && { borderColor: adv.color }]}
                                    >
                                        <View style={[styles.advisorAvatar, { backgroundColor: adv.color + '20' }]}>
                                            <Ionicons name={adv.icon} size={26} color={adv.color} />
                                        </View>
                                        <AppText variant="bodyStrong" center numberOfLines={1} style={styles.advisorName}>
                                            {adv.name}
                                        </AppText>
                                        <AppText variant="caption" center numberOfLines={2} style={styles.advisorSubtitle}>
                                            {adv.subtitle}
                                        </AppText>
                                        {active && (
                                            <View style={styles.advisorCheck}>
                                                <Ionicons name="checkmark-circle" size={18} color={adv.color} />
                                            </View>
                                        )}
                                    </Card>
                                );
                            })}
                        </ScrollView>
                    )}

                    {!advisorsLoading && humanAdvisors.length === 0 && (
                        <View style={styles.humansEmpty}>
                            <EmptyState
                                icon={<Ionicons name="people-outline" size={40} color={Colors.textMuted} />}
                                title="Şu an uzman falcı yok"
                                message="Gerçek falcılarımız çevrimiçi olduğunda burada görünecek. Şimdilik Valeria ile başlayabilirsin."
                            />
                        </View>
                    )}

                    {/* Action card */}
                    <Card glow style={styles.actionCard}>
                        {isAI ? (
                            <>
                                <AppText variant="h2" center>{activeDef.name}</AppText>
                                <AppText variant="body" center style={styles.actionDesc}>
                                    {activeType === 'tarot'
                                        ? 'Valeria senin için üç kart çekip geçmiş, şimdi ve geleceğe dair sezgisel bir yorum sunacak.'
                                        : 'Fincan fotoğraflarını yükle; Valeria enerjine odaklanıp sana özel detaylı bir yorum hazırlayacak.'}
                                </AppText>
                                <View style={styles.costPill}>
                                    <Ionicons name="diamond-outline" size={14} color={Colors.accentYellow} />
                                    <AppText variant="caption" color={Colors.accentYellow} style={styles.costPillText}>
                                        {costLabel(activeDef.cost)}
                                    </AppText>
                                </View>
                                <Button
                                    title={activeType === 'tarot' ? 'Tarot Kartı Çek' : 'Fal Baktır'}
                                    onPress={startValeriaReading}
                                    style={styles.actionBtn}
                                />
                            </>
                        ) : (
                            <>
                                <AppText variant="h2" center>{selectedAdv.name}</AppText>
                                <AppText variant="body" center style={styles.actionDesc}>
                                    {activeType === 'tarot'
                                        ? `Sorunu yaz, ${selectedAdv.name} kartlarını okuyup sana özel bir yorum yazsın.`
                                        : `Fincan fotoğraflarını yükleyip sorunu sor; ${selectedAdv.name} senin için yorumlayacak.`}
                                </AppText>
                                {activeType === 'tarot' && (
                                    <TextInput
                                        style={styles.questionInput}
                                        placeholder="Sorunu yaz..."
                                        placeholderTextColor={Colors.textMuted}
                                        value={question}
                                        onChangeText={setQuestion}
                                        multiline
                                        editable={!sending}
                                        accessibilityLabel="Falcıya sorulacak soru"
                                    />
                                )}
                                <View style={styles.costPill}>
                                    <Ionicons name="diamond-outline" size={14} color={Colors.accentYellow} />
                                    <AppText variant="caption" color={Colors.accentYellow} style={styles.costPillText}>
                                        {ADVISOR_REQUEST_COST} kredi
                                    </AppText>
                                </View>
                                <Button
                                    title={activeType === 'tarot' ? 'Falcıya Gönder' : 'Fotoğraf Yükle ve Baktır'}
                                    onPress={handleAdvisorAction}
                                    loading={sending}
                                    style={styles.actionBtn}
                                />
                            </>
                        )}
                    </Card>
                </View>
            ) : (
                <View style={styles.panel}>
                    <Card glow style={styles.actionCard}>
                        <View style={[styles.tileIcon, styles.sarkacIcon, { backgroundColor: activeDef.color + '20' }]}>
                            <Ionicons name={activeDef.icon} size={30} color={activeDef.color} />
                        </View>
                        <AppText variant="h2" center>{activeDef.name}</AppText>
                        <AppText variant="body" center style={styles.actionDesc}>
                            Sarkaç yalnızca senin enerjinle çalışır — falcı gerekmez. Evet/hayır ile
                            yanıtlanabilecek bir soru sor, sarkaç senin için dönsün.
                        </AppText>
                        <View style={[styles.costPill, styles.costPillFree]}>
                            <Ionicons name="leaf-outline" size={14} color={Colors.success} />
                            <AppText variant="caption" color={Colors.success} style={styles.costPillText}>
                                Ücretsiz • Cihazında çalışır
                            </AppText>
                        </View>
                        <Button title="Sarkaca Sor" onPress={startValeriaReading} style={styles.actionBtn} />
                    </Card>
                </View>
            )}

            {/* Pending advisor requests */}
            <View style={styles.requestsSection}>
                <AppText variant="h2" style={styles.requestsTitle}>Fal İstekleriniz</AppText>

                {requestsLoading ? (
                    <View>
                        {[0, 1].map((i) => (
                            <Card key={i} style={styles.requestCard}>
                                <Skeleton width="60%" height={16} />
                                <Skeleton width="90%" height={12} style={{ marginTop: Spacing.sm }} />
                            </Card>
                        ))}
                    </View>
                ) : pendingRequests.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Ionicons name="hourglass-outline" size={40} color={Colors.textMuted} />}
                            title="Henüz fal isteğin yok"
                            message="Bir uzman falcıya gönderdiğin fallar ve yanıtları burada listelenir."
                        />
                    </Card>
                ) : (
                    pendingRequests.map((req: any) => (
                        <Card key={req._id} style={styles.requestCard}>
                            <View style={styles.requestRow}>
                                <Ionicons
                                    name={req.type === 'tarot' ? 'albums-outline' : 'cafe-outline'}
                                    size={20}
                                    color={Colors.purpleLight}
                                />
                                <View style={styles.requestContent}>
                                    <View style={styles.requestHeader}>
                                        <AppText variant="bodyStrong">{getAdvisorName(req.advisorId)}</AppText>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusColor(req.status) + '20' },
                                            ]}
                                        >
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(req.status) }]} />
                                            <AppText variant="caption" color={getStatusColor(req.status)} style={styles.statusText}>
                                                {getStatusText(req.status)}
                                            </AppText>
                                        </View>
                                    </View>
                                    <AppText variant="body" numberOfLines={2} style={styles.requestQuestion}>
                                        {req.question}
                                    </AppText>
                                    {req.status === 'answered' && req.answer && (
                                        <AppText variant="callout" color={Colors.textPrimary} style={styles.requestAnswer}>
                                            {req.answer}
                                        </AppText>
                                    )}
                                    <AppText variant="caption" style={styles.requestDate}>
                                        {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                                    </AppText>
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    heading: { marginTop: Spacing.sm },
    subheading: { marginTop: Spacing.xs, marginBottom: Spacing.xl },

    tiles: { gap: Spacing.md },
    tile: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, borderWidth: 1.5 },
    tileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    tileIcon: {
        width: 48, height: 48, borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    tileText: { flex: 1, gap: 2 },
    tileMeta: { alignItems: 'flex-end', gap: Spacing.xs },
    costBadge: {
        paddingHorizontal: Spacing.sm, paddingVertical: 3,
        borderRadius: BorderRadius.full, backgroundColor: Colors.goldA12,
    },
    costBadgeFree: { backgroundColor: 'rgba(52, 211, 153, 0.14)' },
    costText: { fontWeight: FontWeight.bold },

    panel: { marginTop: Spacing.xl },
    panelLabel: { marginBottom: Spacing.sm },
    advisorRow: { gap: Spacing.md, paddingVertical: Spacing.xs, paddingRight: Spacing.xl },
    advisorSkeleton: { marginRight: 0 },
    advisorCard: {
        width: 132, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md,
        alignItems: 'center', borderWidth: 1.5, gap: Spacing.xs,
    },
    advisorAvatar: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs,
    },
    advisorName: { width: '100%' },
    advisorSubtitle: {},
    advisorCheck: { position: 'absolute', top: Spacing.sm, right: Spacing.sm },
    humansEmpty: { marginTop: Spacing.sm },

    actionCard: { marginTop: Spacing.lg, alignItems: 'center' },
    sarkacIcon: { marginBottom: Spacing.md },
    actionDesc: { marginTop: Spacing.sm, marginBottom: Spacing.md },
    costPill: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full, backgroundColor: Colors.goldA12,
        marginBottom: Spacing.lg,
    },
    costPillFree: { backgroundColor: 'rgba(52, 211, 153, 0.14)' },
    costPillText: { fontWeight: FontWeight.bold },
    actionBtn: { width: '100%' },
    questionInput: {
        width: '100%', backgroundColor: Colors.surface2, borderRadius: BorderRadius.md,
        padding: Spacing.lg, color: Colors.textPrimary, fontSize: 15,
        borderWidth: 1, borderColor: Colors.border, minHeight: 90,
        textAlignVertical: 'top', marginBottom: Spacing.lg,
    },

    requestsSection: { marginTop: Spacing.xxxl },
    requestsTitle: { marginBottom: Spacing.md },
    requestCard: { marginBottom: Spacing.md },
    requestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    requestContent: { flex: 1 },
    requestHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.xs,
    },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontWeight: FontWeight.semibold },
    requestQuestion: { marginBottom: Spacing.xs },
    requestAnswer: {
        marginTop: Spacing.xs, marginBottom: Spacing.xs,
        backgroundColor: Colors.surface2, padding: Spacing.md,
        borderRadius: BorderRadius.md, borderLeftWidth: 3, borderLeftColor: Colors.success,
    },
    requestDate: { marginTop: Spacing.xs },
});
