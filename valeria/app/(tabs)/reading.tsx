import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, SectionHeader, PrimaryButton } from '../../src/components';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import * as api from '../../src/api';

type Tab = 'tarot' | 'kahve' | 'sarkac';

const ADVISORS = [
    { id: 'valeria', name: 'Valeria', title: 'Mistik Rehber', icon: 'sparkles' as const, color: Colors.accentYellow, isAI: true },
    { id: 'ayse', name: 'Ayşe Hanım', title: 'Tarot Uzmanı', icon: 'person-circle' as const, color: Colors.purpleLight, isAI: false },
    { id: 'mehmet', name: 'Mehmet Hoca', title: 'Kahve Falı', icon: 'person-circle' as const, color: Colors.info, isAI: false },
    { id: 'elif', name: 'Elif Hanım', title: 'Medyum', icon: 'person-circle' as const, color: '#F472B6', isAI: false },
];

export default function ReadingScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('tarot');
    const [selectedAdvisor, setSelectedAdvisor] = useState('valeria');
    const [question, setQuestion] = useState('');
    const [sending, setSending] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const selectedAdv = ADVISORS.find(a => a.id === selectedAdvisor)!;
    const isValearia = selectedAdv.isAI;

    // Load pending requests every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadRequests();
        }, [])
    );

    const loadRequests = async () => {
        try {
            const reqs = await api.readings.advisorRequests();
            setPendingRequests(reqs);
        } catch (e) {
            console.log('loadRequests error:', e);
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleSendToAdvisor = async () => {
        if (!question.trim()) {
            Alert.alert('Soru Gerekli', 'Lütfen falcıya sormak istediğiniz soruyu yazın.');
            return;
        }
        setSending(true);
        try {
            await api.readings.advisorRequest(
                selectedAdvisor,
                activeTab,
                question.trim()
            );
            await refreshEnt();
            Alert.alert(
                'Fal İsteği Gönderildi ✨',
                `${selectedAdv.name} falınızı en kısa sürede okuyacak. Falınız hazır olduğunda bildirim alacaksınız.`,
                [{ text: 'Tamam' }]
            );
            setQuestion('');
            await loadRequests();
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Fal isteği gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: 'tarot', label: 'Tarot', icon: 'layers-outline' },
        { key: 'kahve', label: 'Kahve', icon: 'cafe-outline' },
        { key: 'sarkac', label: 'Sarkaç', icon: 'navigate-outline' },
    ];

    const getStatusColor = (status: string) => status === 'answered' ? Colors.success : Colors.warning;
    const getStatusText = (status: string) => status === 'answered' ? 'Cevaplandı' : 'Beklemede';
    const getAdvisorName = (id: string) => ADVISORS.find(a => a.id === id)?.name || id;

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Fal</Text>

                {/* Segmented Control */}
                <View style={styles.segmented}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={activeTab === tab.key ? Colors.accentYellow : Colors.textMuted}
                            />
                            <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Advisor Selection — for tarot & kahve */}
                {(activeTab === 'tarot' || activeTab === 'kahve') && (
                    <View style={styles.advisorSection}>
                        <Text style={styles.advisorLabel}>Kim baksın?</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.advisorRow}>
                            {ADVISORS.map((adv) => {
                                const isActive = selectedAdvisor === adv.id;
                                return (
                                    <TouchableOpacity
                                        key={adv.id}
                                        style={[styles.advisorCard, isActive && { borderColor: adv.color }]}
                                        onPress={() => setSelectedAdvisor(adv.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.advisorAvatar, { backgroundColor: adv.color + '20' }]}>
                                            <Ionicons name={adv.icon} size={24} color={adv.color} />
                                        </View>
                                        <Text style={[styles.advisorName, isActive && { color: Colors.textPrimary }]}>
                                            {adv.name}
                                        </Text>
                                        <Text style={styles.advisorTitle}>{adv.title}</Text>
                                        {isActive && (
                                            <Ionicons name="checkmark-circle" size={16} color={adv.color} style={styles.advisorCheck} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Tarot Content */}
                {activeTab === 'tarot' && (
                    <View>
                        {isValearia ? (
                            <KismetCard glow style={styles.card}>
                                <Ionicons name="layers" size={48} color={Colors.accentYellow} style={styles.icon} />
                                <Text style={styles.cardTitle}>3 Kartlı Tarot Okuması</Text>
                                <Text style={styles.cardDesc}>
                                    Geçmiş, şimdi ve gelecek için 3 kart çekin. Valeria size kendinize özel, sezgisel okumalar sunacak.
                                </Text>
                                <PrimaryButton
                                    title="Tarot Kartı Çek"
                                    onPress={() => router.push('/tarot-reading')}
                                    style={styles.ctaBtn}
                                />
                            </KismetCard>
                        ) : (
                            <KismetCard glow style={styles.card}>
                                <Ionicons name="layers" size={48} color={selectedAdv.color} style={styles.icon} />
                                <Text style={styles.cardTitle}>{selectedAdv.name} — Tarot Falı</Text>
                                <Text style={styles.cardDesc}>
                                    Sorunuzu yazın ve {selectedAdv.name}'a gönderin. Falcınız kartlarınızı okuyup size özel yorum yazacak.
                                </Text>
                                <TextInput
                                    style={styles.questionInput}
                                    placeholder="Sorunuzu yazın..."
                                    placeholderTextColor={Colors.textMuted}
                                    value={question}
                                    onChangeText={setQuestion}
                                    multiline
                                    numberOfLines={3}
                                    editable={!sending}
                                />
                                <Text style={styles.costNote}>Ücret: 10 kredi</Text>
                                {sending ? (
                                    <ActivityIndicator size="small" color={Colors.accentYellow} style={{ marginTop: Spacing.md }} />
                                ) : (
                                    <PrimaryButton
                                        title="Falcıya Gönder"
                                        onPress={handleSendToAdvisor}
                                        style={styles.ctaBtn}
                                    />
                                )}
                            </KismetCard>
                        )}
                    </View>
                )}

                {/* Kahve Content */}
                {activeTab === 'kahve' && (
                    <View>
                        {isValearia ? (
                            <KismetCard glow style={styles.card}>
                                <Ionicons name="cafe" size={48} color={Colors.purpleLight} style={styles.icon} />
                                <Text style={styles.cardTitle}>Kahve Falı</Text>
                                <Text style={styles.cardDesc}>
                                    Fincan fotoğraflarınızı yükleyin. Valeria enerjinize odaklanıp size özel detaylı fal yorumunuzu hazırlayacak.
                                </Text>
                                <PrimaryButton
                                    title="Fal Baktır"
                                    onPress={() => router.push('/coffee-reading')}
                                    style={styles.ctaBtn}
                                />
                            </KismetCard>
                        ) : (
                            <KismetCard glow style={styles.card}>
                                <Ionicons name="cafe" size={48} color={selectedAdv.color} style={styles.icon} />
                                <Text style={styles.cardTitle}>{selectedAdv.name} — Kahve Falı</Text>
                                <Text style={styles.cardDesc}>
                                    Fincan fotoğraflarınızı yüklemek ve sorunuzu sormak için devam edin. Gerçek falcı sizin için yorumlayacak.
                                </Text>
                                <Text style={styles.costNote}>Ücret: 10 kredi</Text>
                                <PrimaryButton
                                    title="Fotoğraf Yükle ve Baktır"
                                    onPress={() => router.push({ pathname: '/coffee-reading', params: { advisorId: selectedAdv.id } })}
                                    style={styles.ctaBtn}
                                />
                            </KismetCard>
                        )}
                    </View>
                )}

                {/* Sarkaç Content */}
                {activeTab === 'sarkac' && (
                    <View>
                        <KismetCard glow style={styles.card}>
                            <Ionicons name="navigate" size={48} color={Colors.accentYellow} style={styles.icon} />
                            <Text style={styles.cardTitle}>Sarkaç</Text>
                            <Text style={styles.cardDesc}>
                                Evet/Hayır ile cevaplanabilecek bir soru sorun. Sarkaç sizin için dönecek ve cevabınızı verecek.
                            </Text>
                            <PrimaryButton
                                title="Sarkaca Sor"
                                onPress={() => router.push('/pendulum')}
                                style={styles.ctaBtn}
                            />
                        </KismetCard>
                    </View>
                )}

                {/* Pending Reading Requests */}
                {pendingRequests.length > 0 && (
                    <View style={{ marginTop: Spacing.xl }}>
                        <SectionHeader title="Fal İstekleriniz" />
                        {pendingRequests.map((req: any) => (
                            <KismetCard key={req._id} style={styles.requestCard}>
                                <View style={styles.requestRow}>
                                    <Ionicons
                                        name={req.type === 'tarot' ? 'layers-outline' : 'cafe-outline'}
                                        size={20}
                                        color={Colors.purpleLight}
                                    />
                                    <View style={styles.requestContent}>
                                        <View style={styles.requestHeader}>
                                            <Text style={styles.requestTitle}>
                                                {getAdvisorName(req.advisorId)}
                                            </Text>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '20' }]}>
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(req.status) }]} />
                                                <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
                                                    {getStatusText(req.status)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.requestQuestion} numberOfLines={2}>
                                            {req.question}
                                        </Text>
                                        {req.status === 'answered' && req.answer && (
                                            <Text style={styles.requestAnswer}>{req.answer}</Text>
                                        )}
                                        <Text style={styles.requestDate}>
                                            {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                                        </Text>
                                    </View>
                                </View>
                            </KismetCard>
                        ))}
                    </View>
                )}
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
    title: { fontSize: FontSize.hero, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
    segmented: {
        flexDirection: 'row', backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.xl,
        borderWidth: 1, borderColor: Colors.border,
    },
    segment: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: 6,
    },
    segmentActive: { backgroundColor: Colors.backgroundCardLight },
    segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
    segmentTextActive: { color: Colors.accentYellow },
    advisorSection: { marginBottom: Spacing.xl },
    advisorLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.sm },
    advisorRow: { flexDirection: 'row' },
    advisorCard: {
        alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg, backgroundColor: Colors.backgroundCard,
        borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm, width: 90, gap: 4,
    },
    advisorAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    advisorName: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
    advisorTitle: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
    advisorCheck: { position: 'absolute', top: 4, right: 4 },
    aiBadge: {
        position: 'absolute', top: 4, left: 4,
        backgroundColor: Colors.accentYellow, paddingHorizontal: 4, paddingVertical: 1,
        borderRadius: BorderRadius.full,
    },
    aiBadgeText: { fontSize: 8, fontWeight: '700', color: '#000' },
    card: { marginBottom: Spacing.lg, alignItems: 'center' },
    icon: { marginBottom: Spacing.lg },
    cardTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
    cardDesc: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, textAlign: 'center', marginBottom: Spacing.lg },
    ctaBtn: { width: '100%' },
    questionInput: {
        width: '100%', backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, fontSize: FontSize.md, color: Colors.textPrimary,
        borderWidth: 1, borderColor: Colors.border, minHeight: 80, textAlignVertical: 'top',
        marginBottom: Spacing.sm,
    },
    costNote: { fontSize: FontSize.sm, color: Colors.accentYellow, fontWeight: '600', marginBottom: Spacing.sm },
    requestCard: { marginBottom: Spacing.sm },
    requestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    requestContent: { flex: 1 },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    requestTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '600' },
    requestQuestion: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
    requestAnswer: {
        fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20,
        backgroundColor: Colors.backgroundCard, padding: Spacing.sm, borderRadius: BorderRadius.md,
        marginBottom: 4, borderLeftWidth: 3, borderLeftColor: Colors.success,
    },
    requestDate: { fontSize: FontSize.xs, color: Colors.textMuted },
});
