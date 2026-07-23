import React, { useState, useCallback } from 'react';
import {
    StyleSheet, View, Text, ScrollView, Alert, TouchableOpacity,
    Image, Modal, Switch, Linking
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground, KismetCard, SectionHeader, StatBar, ListItemRow } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { getTimeUntilReset } from '../../src/utils/dailyReset';
import * as api from '../../src/api';

export default function ProfileScreen() {
    const { profile, logout, loadProfile } = useUserStore();
    const credits = useEntitlementsStore((s) => s.credits);
    const xp = useEntitlementsStore((s) => s.xp);
    const level = useEntitlementsStore((s) => s.level);
    const streakDays = useEntitlementsStore((s) => s.streakDays);
    const dailyQuestionsRemaining = useEntitlementsStore((s) => s.dailyQuestionsRemaining);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const xpInLevel = xp % 100;
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    // Premium modal
    const [premiumVisible, setPremiumVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [purchasing, setPurchasing] = useState(false);

    // Settings toggles
    const [notifEnabled, setNotifEnabled] = useState(true);
    const [dailyReminder, setDailyReminder] = useState(true);
    const [shareData, setShareData] = useState(false);

    const isPremium = (profile as any).membershipType === 'premium';

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
            // Upload to backend
            try {
                const formData = new FormData();
                const uri = result.assets[0].uri;
                const ext = uri.split('.').pop() || 'jpg';
                formData.append('avatar', {
                    uri,
                    name: `avatar.${ext}`,
                    type: `image/${ext}`,
                } as any);
                await api.profile.uploadAvatar(formData);
            } catch (e: any) {
                console.log('Avatar upload failed (demo):', e.message);
            }
        }
    };

    const handlePurchasePremium = useCallback(async () => {
        setPurchasing(true);
        try {
            const planId = selectedPlan === 'monthly' ? 'plan_premium_monthly' : 'plan_premium_yearly';
            const result = await api.subscriptions.purchase(planId, 'demo_receipt', 'ios');
            await refreshEnt();
            await loadProfile();
            setPremiumVisible(false);
            Alert.alert(
                '🎉 Tebrikler!',
                `Valeria Premium aktif edildi! ${result.credits} krediniz var.`
            );
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Satın alma başarısız');
        } finally {
            setPurchasing(false);
        }
    }, [selectedPlan]);

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header with Photo */}
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.name}>{profile.name}</Text>
                    <View style={styles.signRow}>
                        <Text style={styles.signLabel}>{profile.sunSign} · Seviye {level}</Text>
                        {isPremium && (
                            <View style={styles.premiumInlineBadge}>
                                <Ionicons name="diamond" size={10} color="#000" />
                                <Text style={styles.premiumInlineText}>Premium</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Membership + Stats */}
                <KismetCard glow style={styles.memberCard}>
                    <View style={styles.memberRow}>
                        <View style={styles.memberInfo}>
                            <View style={[styles.memberBadge, isPremium ? styles.memberBadgePremium : styles.memberBadgeFree]}>
                                <Ionicons name={isPremium ? 'diamond' : 'person'} size={14} color={isPremium ? '#000' : Colors.textMuted} />
                                <Text style={[styles.memberBadgeText, isPremium && { color: '#000' }]}>
                                    {isPremium ? 'Premium' : 'Ücretsiz'}
                                </Text>
                            </View>
                            <Text style={styles.memberLabel}>Üyelik</Text>
                        </View>
                        <View style={styles.memberDivider} />
                        <View style={styles.memberInfo}>
                            <Text style={styles.statValue}>{credits}</Text>
                            <Text style={styles.memberLabel}>Kredi</Text>
                        </View>
                        <View style={styles.memberDivider} />
                        <View style={styles.memberInfo}>
                            <Text style={styles.statValue}>{level}</Text>
                            <Text style={styles.memberLabel}>Seviye</Text>
                        </View>
                        <View style={styles.memberDivider} />
                        <View style={styles.memberInfo}>
                            <Text style={[styles.statValue, { color: Colors.warning }]}>{streakDays}</Text>
                            <Text style={styles.memberLabel}>Seri</Text>
                        </View>
                    </View>
                    <StatBar label="XP" value={xpInLevel} maxValue={100} color={Colors.accentYellow} style={{ marginTop: Spacing.md }} />
                </KismetCard>

                {/* Reklam İzle Kredi Kazan */}
                <TouchableOpacity
                    style={styles.adWatchCard}
                    activeOpacity={0.8}
                    onPress={async () => {
                        try {
                            const watchAd = useEntitlementsStore.getState().watchAd;
                            const success = await watchAd();
                            if (success) {
                                Alert.alert('Tebrikler!', '10 kredi kazandınız!');
                            } else {
                                Alert.alert('Hata', 'Reklam izlenemedi, tekrar deneyin.');
                            }
                        } catch (e: any) {
                            Alert.alert('Hata', e.message || 'Reklam izlenemedi');
                        }
                    }}
                >
                    <View style={styles.adWatchLeft}>
                        <Ionicons name="play-circle-outline" size={28} color={Colors.accentYellow} />
                        <View style={{ marginLeft: Spacing.sm }}>
                            <Text style={styles.adWatchTitle}>Reklam İzle, Kredi Kazan</Text>
                            <Text style={styles.adWatchDesc}>Kısa bir reklam izleyerek 10 kredi kazanın</Text>
                        </View>
                    </View>
                    <View style={styles.adWatchBadge}>
                        <Text style={styles.adWatchBadgeText}>+10</Text>
                    </View>
                </TouchableOpacity>

                {/* Premium Upgrade */}
                {!isPremium ? (
                    <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.8} onPress={() => setPremiumVisible(true)}>
                        <View style={styles.upgradeLeft}>
                            <Ionicons name="star" size={24} color={Colors.accentYellow} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.upgradeTitle}>Valeria Premium</Text>
                                <Text style={styles.upgradeDesc}>Günlük ücretsiz sorular, ekstra kredi, reklamsız deneyim</Text>
                            </View>
                        </View>
                        <View style={styles.upgradeBtn}>
                            <Text style={styles.upgradeBtnText}>Yükselt</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <KismetCard style={styles.premiumActiveCard}>
                        <View style={styles.premiumActiveRow}>
                            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                <Text style={styles.premiumActiveTitle}>Valeria Premium Aktif ✨</Text>
                                <Text style={styles.premiumActiveDesc}>
                                    Günlük 2 ücretsiz soru · Aylık 800 kredi · Reklamsız
                                </Text>
                            </View>
                        </View>
                    </KismetCard>
                )}

                {/* Günlük Haklarım */}
                <SectionHeader title="Günlük Haklarım" />
                <KismetCard style={styles.dailyCard}>
                    <View style={styles.dailyRow}>
                        <View style={styles.dailyItem}>
                            <Text style={styles.dailyValue}>{dailyQuestionsRemaining}</Text>
                            <Text style={styles.dailyLabel}>Kalan Soru</Text>
                        </View>
                        <View style={styles.dailyDivider} />
                        <View style={styles.dailyItem}>
                            <Text style={styles.dailyValue}>{isPremium ? 2 : 0}</Text>
                            <Text style={styles.dailyLabel}>Günlük Limit</Text>
                        </View>
                    </View>
                    <Text style={styles.resetTimeText}>
                        Bugün 00:00'da yenilenir ({getTimeUntilReset()})
                    </Text>
                </KismetCard>

                {/* Başarımlar */}
                <SectionHeader title="Başarımlar" />
                <View style={styles.badges}>
                    <View style={[styles.badge, streakDays >= 7 && styles.badgeActive]}>
                        <Ionicons name="flame" size={24} color={streakDays >= 7 ? Colors.accentYellow : Colors.textMuted} />
                        <Text style={styles.badgeLabel}>7 Gün Seri</Text>
                    </View>
                    <View style={[styles.badge, styles.badgeActive]}>
                        <Ionicons name="layers" size={24} color={Colors.accentYellow} />
                        <Text style={styles.badgeLabel}>İlk Tarot</Text>
                    </View>
                    <View style={[styles.badge]}>
                        <Ionicons name="book" size={24} color={Colors.textMuted} />
                        <Text style={styles.badgeLabel}>İlk Öğrenme</Text>
                    </View>
                    <View style={[styles.badge]}>
                        <Ionicons name="chatbubble" size={24} color={Colors.textMuted} />
                        <Text style={styles.badgeLabel}>İlk Soru</Text>
                    </View>
                </View>

                {/* Ayarlar */}
                <SectionHeader title="Ayarlar" />
                <ListItemRow
                    icon="wallet-outline"
                    title="Kredi Yükle"
                    onPress={() => router.push('/buy-credits')}
                />

                {/* Bildirimler */}
                <SectionHeader title="Bildirimler" />
                <KismetCard style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.settingText}>Push Bildirimleri</Text>
                        </View>
                        <Switch
                            value={notifEnabled}
                            onValueChange={setNotifEnabled}
                            trackColor={{ false: Colors.border, true: Colors.purple }}
                            thumbColor={notifEnabled ? Colors.accentYellow : Colors.textMuted}
                        />
                    </View>
                    <View style={styles.settingDivider} />
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="alarm-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.settingText}>Günlük Hatırlatma</Text>
                        </View>
                        <Switch
                            value={dailyReminder}
                            onValueChange={setDailyReminder}
                            trackColor={{ false: Colors.border, true: Colors.purple }}
                            thumbColor={dailyReminder ? Colors.accentYellow : Colors.textMuted}
                        />
                    </View>
                </KismetCard>

                {/* Gizlilik */}
                <SectionHeader title="Gizlilik" />
                <KismetCard style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="analytics-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.settingText}>Kullanım Verisi Paylaş</Text>
                        </View>
                        <Switch
                            value={shareData}
                            onValueChange={setShareData}
                            trackColor={{ false: Colors.border, true: Colors.purple }}
                            thumbColor={shareData ? Colors.accentYellow : Colors.textMuted}
                        />
                    </View>
                    <View style={styles.settingDivider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://valeria.app/privacy')}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.settingText}>Gizlilik Politikası</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.settingDivider} />
                    <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://valeria.app/terms')}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.purpleLight} />
                            <Text style={styles.settingText}>Kullanım Koşulları</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                </KismetCard>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                        Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
                            { text: 'Vazgeç', style: 'cancel' },
                            {
                                text: 'Çıkış Yap',
                                style: 'destructive',
                                onPress: async () => {
                                    await logout();
                                    router.replace('/(auth)/login');
                                },
                            },
                        ]);
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

                {/* Disclaimer */}
                <KismetCard style={styles.disclaimer}>
                    <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.disclaimerText}>
                        Bu uygulamadaki içerikler eğlence ve kişisel farkındalık amaçlıdır. Kesinlik ve garanti içermez.
                    </Text>
                </KismetCard>
            </ScrollView>

            {/* Premium Modal */}
            <Modal visible={premiumVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Close */}
                        <TouchableOpacity style={styles.modalClose} onPress={() => setPremiumVisible(false)}>
                            <Ionicons name="close" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Icon & Title */}
                        <Ionicons name="diamond" size={48} color={Colors.accentYellow} style={{ alignSelf: 'center', marginBottom: Spacing.md }} />
                        <Text style={styles.modalTitle}>Valeria Premium</Text>
                        <Text style={styles.modalSubtitle}>Tüm özelliklere sınırsız erişim</Text>

                        {/* Features */}
                        <View style={styles.featureList}>
                            {[
                                { icon: 'chatbubble-ellipses', text: 'Günlük 2 ücretsiz soru' },
                                { icon: 'diamond', text: 'Aylık 800 kredi (yıllık 9600)' },
                                { icon: 'cafe', text: 'Günlük 1 ücretsiz kahve falı' },
                                { icon: 'layers', text: 'Günlük 1 ücretsiz tarot falı' },
                                { icon: 'eye-off', text: 'Reklamsız deneyim' },
                                { icon: 'star', text: 'Öncelikli danışman erişimi' },
                            ].map((f, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons name={f.icon as any} size={18} color={Colors.accentYellow} />
                                    <Text style={styles.featureText}>{f.text}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Plan Tabs */}
                        <View style={styles.planTabs}>
                            <TouchableOpacity
                                style={[styles.planTab, selectedPlan === 'monthly' && styles.planTabActive]}
                                onPress={() => setSelectedPlan('monthly')}
                            >
                                <Text style={[styles.planTabLabel, selectedPlan === 'monthly' && styles.planTabLabelActive]}>Aylık</Text>
                                <Text style={[styles.planTabPrice, selectedPlan === 'monthly' && styles.planTabPriceActive]}>₺99</Text>
                                <Text style={[styles.planTabSub, selectedPlan === 'monthly' && styles.planTabSubActive]}>ayda</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.planTab, selectedPlan === 'yearly' && styles.planTabActive]}
                                onPress={() => setSelectedPlan('yearly')}
                            >
                                <View style={styles.saveBadge}>
                                    <Text style={styles.saveBadgeText}>%25 Kazanç</Text>
                                </View>
                                <Text style={[styles.planTabLabel, selectedPlan === 'yearly' && styles.planTabLabelActive]}>Yıllık</Text>
                                <Text style={[styles.planTabPrice, selectedPlan === 'yearly' && styles.planTabPriceActive]}>₺899</Text>
                                <Text style={[styles.planTabSub, selectedPlan === 'yearly' && styles.planTabSubActive]}>yılda</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Purchase Button */}
                        <TouchableOpacity
                            style={[styles.purchaseBtn, purchasing && { opacity: 0.5 }]}
                            disabled={purchasing}
                            onPress={handlePurchasePremium}
                        >
                            <Text style={styles.purchaseBtnText}>
                                {purchasing ? 'İşleniyor...' : `Premium'a Yükselt`}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.modalDisclaimer}>
                            Abonelik, dönem sonunda otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz.
                        </Text>
                    </View>
                </View>
            </Modal>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: 40,
    },
    // Header
    headerTop: { alignItems: 'center', marginBottom: Spacing.xl },
    avatarWrap: { position: 'relative', marginBottom: Spacing.md },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: Colors.accentYellow,
    },
    avatarPlaceholder: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: Colors.purple,
        backgroundColor: Colors.purple + '30',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 36, fontWeight: '700', color: Colors.purpleLight },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.purple,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: Colors.backgroundDark,
    },
    name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
    signRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
    signLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
    premiumInlineBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: Colors.accentYellow, paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    premiumInlineText: { fontSize: 10, fontWeight: '700', color: '#000' },
    // Member Card
    memberCard: { marginBottom: Spacing.xl },
    memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    memberInfo: { alignItems: 'center', gap: 4 },
    memberDivider: { width: 1, height: 32, backgroundColor: Colors.border },
    memberBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full,
    },
    memberBadgePremium: { backgroundColor: Colors.accentYellow },
    memberBadgeFree: { backgroundColor: Colors.border },
    memberBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
    memberLabel: { fontSize: 10, color: Colors.textMuted },
    statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
    // Ad Watch
    adWatchCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
        padding: Spacing.md, borderWidth: 1, borderColor: Colors.accentYellow + '40',
        marginBottom: Spacing.md,
    },
    adWatchLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    adWatchTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
    adWatchDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    adWatchBadge: {
        backgroundColor: Colors.accentYellow, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm, paddingVertical: 4,
    },
    adWatchBadgeText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.backgroundDark },
    // Upgrade Card
    upgradeCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.purple + '20', borderWidth: 1,
        borderColor: Colors.accentYellow + '30', borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.xl,
    },
    upgradeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    upgradeTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.accentYellow },
    upgradeDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
    upgradeBtn: {
        backgroundColor: Colors.accentYellow, paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    },
    upgradeBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#000' },
    // Premium Active
    premiumActiveCard: { marginBottom: Spacing.xl, borderColor: Colors.success + '30' },
    premiumActiveRow: { flexDirection: 'row', alignItems: 'center' },
    premiumActiveTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.success },
    premiumActiveDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
    // Daily
    dailyCard: { marginBottom: Spacing.lg },
    dailyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
    dailyItem: { flex: 1, alignItems: 'center' },
    dailyValue: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.accentYellow },
    dailyLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
    dailyDivider: { width: 1, height: 40, backgroundColor: Colors.border },
    resetTimeText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
    // Badges
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
    badge: {
        width: '47%', alignItems: 'center', paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg, backgroundColor: Colors.backgroundCard,
        borderWidth: 1, borderColor: Colors.border, gap: Spacing.xs, opacity: 0.5,
    },
    badgeActive: { opacity: 1, borderColor: Colors.accentYellow + '40' },
    badgeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
    // Settings
    settingsCard: { marginBottom: Spacing.md },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    settingText: { fontSize: FontSize.sm, color: Colors.textPrimary },
    settingDivider: { height: 1, backgroundColor: Colors.border + '40', marginVertical: 2 },
    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        marginTop: Spacing.xl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.error + '40', backgroundColor: Colors.error + '10',
    },
    logoutText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.error },
    // Disclaimer
    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        marginTop: Spacing.xl, marginBottom: Spacing.xxl,
    },
    disclaimerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.backgroundCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: Spacing.xl, paddingBottom: 40,
    },
    modalClose: { position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 1 },
    modalTitle: {
        fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary,
        textAlign: 'center', marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    // Features
    featureList: { marginBottom: Spacing.lg },
    featureRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingVertical: 6,
    },
    featureText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    // Plan Tabs
    planTabs: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
    planTab: {
        flex: 1, alignItems: 'center', paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: Colors.border,
        position: 'relative',
    },
    planTabActive: { borderColor: Colors.accentYellow, backgroundColor: Colors.accentYellow + '10' },
    planTabLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
    planTabLabelActive: { color: Colors.accentYellow },
    planTabPrice: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginVertical: 2 },
    planTabPriceActive: { color: Colors.accentYellow },
    planTabSub: { fontSize: FontSize.xs, color: Colors.textMuted },
    planTabSubActive: { color: Colors.textSecondary },
    saveBadge: {
        position: 'absolute', top: -10,
        backgroundColor: Colors.success, paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    saveBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
    // Purchase
    purchaseBtn: {
        backgroundColor: Colors.accentYellow, paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full, alignItems: 'center', marginBottom: Spacing.md,
    },
    purchaseBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#000' },
    modalDisclaimer: {
        fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 16,
    },
});
