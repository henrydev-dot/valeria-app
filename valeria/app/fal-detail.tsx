import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText, LoadingView, EmptyState } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import * as api from '../src/api';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

const FOLLOW_UP_COST = 10;

interface ThreadMsg {
    role: 'user' | 'advisor';
    text: string;
    at?: string;
}

/**
 * Fala özel sohbet ekranı: fal yorumu danışman balonu olarak görünür,
 * kullanıcı 10 krediye ek soru sorabilir; cevap aynı sohbete düşer.
 */
export default function FalDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [question, setQuestion] = useState('');
    const [sending, setSending] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const data = await api.readings.advisorRequestDetail(String(id));
            setRequest(data);
            setError(false);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Yanıt beklenirken 5 sn'de bir tazele (Valeria 10-20 sn içinde yanıtlar).
    useEffect(() => {
        if (request?.status === 'pending') {
            pollRef.current = setInterval(load, 5000);
        }
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [request?.status, load]);

    // Yeni mesaj gelince en alta kay
    const threadLen = request?.thread?.length ?? 0;
    useEffect(() => {
        const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
        return () => clearTimeout(t);
    }, [threadLen, request?.status]);

    const sendFollowUp = async () => {
        const q = question.trim();
        if (!q || !request) return;
        if (credits < FOLLOW_UP_COST) {
            Alert.alert(
                'Yetersiz Kredi',
                `Ek soru için ${FOLLOW_UP_COST} kredi gerekiyor (mevcut: ${credits}). Profildeki günlük ödülünü alarak ücretsiz kredi kazanabilirsin.`
            );
            return;
        }
        setSending(true);
        try {
            const updated = await api.readings.advisorFollowUp(request._id, q);
            setRequest(updated);
            setQuestion('');
            await refreshEnt();
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Soru gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    // Eski kayıtlar için (thread'siz) soru+cevaptan sohbet türet
    const thread: ThreadMsg[] = (request?.thread?.length
        ? request.thread
        : [
            ...(request?.question && request.question !== '-'
                ? [{ role: 'user' as const, text: request.question }]
                : []),
            ...(request?.answer ? [{ role: 'advisor' as const, text: request.answer }] : []),
        ]);

    const advisorName = request?.advisorName || (request?.advisorId === 'valeria' ? 'Valeria' : 'Falcı');
    const isPending = request?.status === 'pending';

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Başlık */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Geri"
                >
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.advisorAvatar}>
                        <Ionicons
                            name={request?.advisorId === 'valeria' ? 'sparkles' : 'person'}
                            size={16}
                            color={Colors.accentYellow}
                        />
                    </View>
                    <View>
                        <AppText variant="bodyStrong">{advisorName}</AppText>
                        <AppText variant="caption" color={isPending ? Colors.warning : Colors.success}>
                            {isPending ? 'Yorumluyor...' : 'Falın yorumlandı'}
                        </AppText>
                    </View>
                </View>
                <View style={styles.creditPill}>
                    <Ionicons name="diamond" size={12} color={Colors.accentYellow} />
                    <AppText variant="caption" color={Colors.accentYellow}>{credits}</AppText>
                </View>
            </View>

            {loading ? (
                <LoadingView text="Falın yükleniyor..." />
            ) : error || !request ? (
                <EmptyState
                    icon={<Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />}
                    title="Fal yüklenemedi"
                    message="Bağlantını kontrol edip tekrar dene."
                    actionLabel="Tekrar Dene"
                    onAction={() => { setLoading(true); load(); }}
                />
            ) : (
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={8}
                >
                    <ScrollView
                        ref={scrollRef}
                        style={styles.flex}
                        contentContainerStyle={styles.chatContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Fal künyesi */}
                        <View style={styles.metaCard}>
                            <View style={styles.metaRow}>
                                <Ionicons
                                    name={request.type === 'tarot' ? 'albums' : 'cafe'}
                                    size={16}
                                    color={Colors.purpleLight}
                                />
                                <AppText variant="label" color={Colors.purpleLight}>
                                    {request.type === 'tarot' ? 'TAROT AÇILIMI' : 'KAHVE FALI'}
                                </AppText>
                                <AppText variant="caption" color={Colors.textMuted} style={styles.metaDate}>
                                    {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                                </AppText>
                            </View>
                            {request.cards?.length > 0 && (
                                <View style={styles.cardChips}>
                                    {request.cards.map((c: any, i: number) => (
                                        <View key={i} style={styles.cardChip}>
                                            <AppText variant="caption" color={Colors.accentYellow}>
                                                {c.position}: {c.name}{c.isReversed ? ' (Ters)' : ''}
                                            </AppText>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Sohbet balonları */}
                        {thread.map((m, i) => (
                            <View
                                key={i}
                                style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAdvisor]}
                            >
                                {m.role === 'advisor' && (
                                    <AppText variant="label" color={Colors.accentYellow} style={styles.bubbleName}>
                                        {advisorName}
                                    </AppText>
                                )}
                                <AppText variant="body" style={styles.bubbleText}>{m.text}</AppText>
                            </View>
                        ))}

                        {/* Yanıt bekleniyor göstergesi */}
                        {isPending && (
                            <View style={[styles.bubble, styles.bubbleAdvisor, styles.typingBubble]}>
                                <ActivityIndicator size="small" color={Colors.accentYellow} />
                                <AppText variant="caption" color={Colors.textMuted}>
                                    {advisorName} yorumluyor...
                                </AppText>
                            </View>
                        )}
                    </ScrollView>

                    {/* Ek soru girişi — yalnız cevaplanmış falda */}
                    {!isPending && (
                        <View style={styles.inputBar}>
                            <TextInput
                                style={styles.input}
                                placeholder={`Falınla ilgili ek soru sor (${FOLLOW_UP_COST} kredi)...`}
                                placeholderTextColor={Colors.textMuted}
                                value={question}
                                onChangeText={setQuestion}
                                multiline
                                maxLength={500}
                                editable={!sending}
                                accessibilityLabel="Ek soru"
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, (!question.trim() || sending) && styles.sendBtnDisabled]}
                                onPress={sendFollowUp}
                                disabled={!question.trim() || sending}
                                accessibilityRole="button"
                                accessibilityLabel={`Soruyu gönder, ${FOLLOW_UP_COST} kredi`}
                            >
                                {sending ? (
                                    <ActivityIndicator size="small" color={Colors.textOnAccent} />
                                ) : (
                                    <Ionicons name="send" size={18} color={Colors.textOnAccent} />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.backgroundDark },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border,
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    advisorAvatar: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: Colors.goldA12, borderWidth: 1, borderColor: Colors.borderAccent,
        alignItems: 'center', justifyContent: 'center',
    },
    creditPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.goldA12, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm, paddingVertical: 4,
    },
    chatContent: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
    metaCard: {
        backgroundColor: Colors.surface1, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.border,
        padding: Spacing.md, gap: Spacing.sm,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    metaDate: { marginLeft: 'auto' },
    cardChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    cardChip: {
        backgroundColor: Colors.goldA12, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm, paddingVertical: 3,
        borderWidth: 1, borderColor: Colors.borderAccent,
    },
    bubble: {
        maxWidth: '88%', borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    bubbleUser: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.goldA12,
        borderWidth: 1, borderColor: Colors.borderAccent,
        borderBottomRightRadius: BorderRadius.sm,
    },
    bubbleAdvisor: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.surface2,
        borderWidth: 1, borderColor: Colors.border,
        borderBottomLeftRadius: BorderRadius.sm,
    },
    bubbleName: { marginBottom: Spacing.xs },
    bubbleText: { lineHeight: 22 },
    typingBubble: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border,
        backgroundColor: Colors.backgroundDark,
    },
    input: {
        flex: 1, maxHeight: 110, minHeight: 44,
        backgroundColor: Colors.surface1, borderRadius: BorderRadius.xl,
        borderWidth: 1, borderColor: Colors.border,
        color: Colors.textPrimary, fontSize: 15,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.accentYellow,
        alignItems: 'center', justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
});
