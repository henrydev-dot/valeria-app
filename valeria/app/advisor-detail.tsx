import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, PrimaryButton, StatBar } from '../src/components';
import { useContentStore } from '../src/stores/useContentStore';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';

export default function AdvisorDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const advisors = useContentStore((s) => s.advisors);
    const { spendCredits } = useEntitlementsStore();
    const advisor = advisors.find((a) => String(a.id) === id);
    const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [chatActive, setChatActive] = useState(false);

    if (!advisor) {
        return (
            <GradientBackground>
                <View style={styles.center}>
                    <Text style={styles.notFound}>Danisman bulunamadi.</Text>
                </View>
            </GradientBackground>
        );
    }

    const startSession = (pkg: { duration: string; credits: number }) => {
        if (!spendCredits(pkg.credits)) {
            Alert.alert('Yetersiz Kredi', `Bu seans icin ${pkg.credits} kredi gerekiyor.`);
            return;
        }
        setChatActive(true);
        setMessages([
            { role: 'system', text: `${advisor.name} ile ${pkg.duration} seansiniz basliyor.` },
            { role: 'advisor', text: `Merhaba! Ben ${advisor.name}. Size nasil yardimci olabilirim?` },
        ]);
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        const advisorMsg = {
            role: 'advisor',
            text: `Anlattiklriniz cok onemli. ${advisor.specialties[0]} perspektifinden bakildiginda, bu durumun size onemli bir mesaj tasidiigini goruyorum. Sabirl olmanizi ve ic sesinize guvenmenizi oneririm.`,
        };
        setMessages((prev) => [...prev, userMsg, advisorMsg]);
        setInput('');
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{advisor.name}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {!chatActive ? (
                    <View>
                        {/* Profile Card */}
                        <KismetCard glow style={styles.profileCard}>
                            <View style={styles.avatarLarge}>
                                <Ionicons name="person" size={40} color={Colors.purpleLight} />
                            </View>
                            <Text style={styles.name}>{advisor.name}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={Colors.accentYellow} />
                                <Text style={styles.rating}>{advisor.rating}</Text>
                                <Text style={styles.sessions}>{advisor.sessions} seans tamamlandi</Text>
                            </View>
                            <View style={styles.tags}>
                                {advisor.specialties.map((s) => (
                                    <View key={s} style={styles.tag}>
                                        <Text style={styles.tagText}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </KismetCard>

                        {/* Bio */}
                        <KismetCard style={styles.section}>
                            <Text style={styles.sectionTitle}>Hakkinda</Text>
                            <Text style={styles.bio}>{advisor.bio}</Text>
                        </KismetCard>

                        {/* Packages */}
                        <KismetCard style={styles.section}>
                            <Text style={styles.sectionTitle}>Seans Paketleri</Text>
                            {advisor.packages.map((pkg, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.packageRow}
                                    onPress={() => startSession(pkg)}
                                >
                                    <View>
                                        <Text style={styles.packageDuration}>{pkg.duration}</Text>
                                        <Text style={styles.packageCredits}>{pkg.credits} kredi</Text>
                                    </View>
                                    <PrimaryButton title="Danis" onPress={() => startSession(pkg)} />
                                </TouchableOpacity>
                            ))}
                        </KismetCard>

                        {/* Reviews */}
                        <KismetCard style={styles.section}>
                            <Text style={styles.sectionTitle}>Yorumlar</Text>
                            {advisor.reviews.map((r, idx) => (
                                <View key={idx} style={styles.review}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewUser}>{r.user}</Text>
                                        <View style={styles.reviewStars}>
                                            {Array.from({ length: r.rating }).map((_, i) => (
                                                <Ionicons key={i} name="star" size={12} color={Colors.accentYellow} />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={styles.reviewText}>{r.text}</Text>
                                </View>
                            ))}
                        </KismetCard>
                    </View>
                ) : (
                    <View style={styles.chatContainer}>
                        {messages.map((msg, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.message,
                                    msg.role === 'user' ? styles.userMsg : styles.advisorMsg,
                                ]}
                            >
                                <Text style={[
                                    styles.msgText,
                                    msg.role === 'user' ? styles.userMsgText : styles.advisorMsgText,
                                ]}>
                                    {msg.text}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Mesajinizi yazin..."
                                placeholderTextColor={Colors.textMuted}
                                value={input}
                                onChangeText={setInput}
                            />
                            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                                <Ionicons name="send" size={18} color={Colors.backgroundDark} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.purple + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    name: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.xs,
        marginBottom: Spacing.md,
    },
    rating: {
        fontSize: FontSize.md,
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
    },
    tag: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purple + '20',
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.purpleLight,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    bio: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    packageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    packageDuration: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    packageCredits: {
        fontSize: FontSize.sm,
        color: Colors.accentYellow,
    },
    review: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    reviewUser: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    // Chat
    chatContainer: {
        flex: 1,
    },
    message: {
        maxWidth: '80%',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    userMsg: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.purple,
    },
    advisorMsg: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.backgroundCard,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    msgText: {
        fontSize: FontSize.md,
        lineHeight: 22,
    },
    userMsgText: {
        color: Colors.textPrimary,
    },
    advisorMsgText: {
        color: Colors.textSecondary,
    },
    inputRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
    chatInput: {
        flex: 1,
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accentYellow,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
