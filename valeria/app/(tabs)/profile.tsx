import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet, View, Image, Modal, Switch, Linking,
    TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Card, AppText, Button, ProgressBar, Chip } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { getTimeUntilReset } from '../../src/utils/dailyReset';
import { RELATIONSHIP_OPTIONS, WORK_OPTIONS } from '../../src/data/onboardingOptions';
import { Config, Features } from '../../src/config';
import * as api from '../../src/api';
import { registerForPushNotificationsAsync } from '../_layout';

const NOTIF_PREF_KEY = '@valeria_notif_enabled';

/* ---------------- Generic list row ---------------- */
function Row({
    icon, iconColor, title, subtitle, onPress, right, danger, disabled, accessibilityLabel,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    accessibilityLabel?: string;
}) {
    const titleColor = danger ? Colors.error : Colors.textPrimary;
    return (
        <TouchableOpacity
            style={styles.row}
            activeOpacity={onPress && !disabled ? 0.7 : 1}
            onPress={onPress}
            disabled={!onPress || disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
        >
            <View style={styles.rowLeft}>
                <Ionicons name={icon} size={20} color={iconColor || (danger ? Colors.error : Colors.purpleLight)} />
                <View style={styles.rowTexts}>
                    <AppText variant="bodyStrong" color={titleColor}>{title}</AppText>
                    {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
                </View>
            </View>
            {right !== undefined
                ? right
                : onPress
                    ? <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    : null}
        </TouchableOpacity>
    );
}

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

    // Bilgilerimi Düzenle (ilişki + iş durumu)
    const [editVisible, setEditVisible] = useState(false);
    const [editRelationship, setEditRelationship] = useState('');
    const [editWork, setEditWork] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    const saveProfileEdit = async () => {
        if (!editRelationship || !editWork) return;
        setSavingEdit(true);
        try {
            await api.profile.update({ relationshipStatus: editRelationship, workStatus: editWork });
            await loadProfile();
            setEditVisible(false);
            Alert.alert('Kaydedildi', 'Bilgilerin güncellendi — bundan sonraki fallar yeni durumuna göre kişiselleşecek.');
        } catch (e: any) {
            Alert.alert('Hata', e?.message || 'Bilgiler güncellenemedi');
        } finally {
            setSavingEdit(false);
        }
    };
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [purchasing, setPurchasing] = useState(false);

    // Notifications — backed by real OS permission + persisted preference
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [notifBusy, setNotifBusy] = useState(false);

    const isPremium = (profile as any).membershipType === 'premium';

    useEffect(() => {
        (async () => {
            try {
                const [pref, perm] = await Promise.all([
                    AsyncStorage.getItem(NOTIF_PREF_KEY),
                    Notifications.getPermissionsAsync(),
                ]);
                setNotifEnabled(perm.status === 'granted' && pref !== 'false');
            } catch {
                setNotifEnabled(false);
            }
        })();
    }, []);

    const handleToggleNotif = useCallback(async (value: boolean) => {
        if (!value) {
            setNotifEnabled(false);
            await AsyncStorage.setItem(NOTIF_PREF_KEY, 'false');
            return;
        }
        setNotifBusy(true);
        try {
            await registerForPushNotificationsAsync();
            const perm = await Notifications.getPermissionsAsync();
            if (perm.status === 'granted') {
                setNotifEnabled(true);
                await AsyncStorage.setItem(NOTIF_PREF_KEY, 'true');
            } else {
                setNotifEnabled(false);
                await AsyncStorage.setItem(NOTIF_PREF_KEY, 'false');
                Alert.alert(
                    'Bildirim İzni Gerekli',
                    'Bildirimleri açmak için cihaz ayarlarından Valeria için bildirim izni vermelisiniz.',
                    [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
                    ]
                );
            }
        } catch {
            setNotifEnabled(false);
            Alert.alert('Hata', 'Bildirimler etkinleştirilemedi. Lütfen tekrar deneyin.');
        } finally {
            setNotifBusy(false);
        }
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri); // local preview kept regardless of upload result
            try {
                const formData = new FormData();
                const ext = uri.split('.').pop() || 'jpg';
                formData.append('avatar', {
                    uri,
                    name: `avatar.${ext}`,
                    type: `image/${ext}`,
                } as any);
                await api.profile.uploadAvatar(formData);
            } catch {
                Alert.alert(
                    'Yükleme Başarısız',
                    'Profil fotoğrafın sunucuya yüklenemedi. Önizleme gösteriliyor; bağlantını kontrol edip tekrar dene.'
                );
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
                'Tebrikler!',
                `Valeria Premium aktif edildi! ${result.credits} krediniz var.`
            );
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Satın alma başarısız');
        } finally {
            setPurchasing(false);
        }
    }, [selectedPlan, refreshEnt, loadProfile]);

    // Achievements computed from real entitlement signals — no fake badges
    const achievements: { icon: keyof typeof Ionicons.glyphMap; label: string; unlocked: boolean }[] = [
        { icon: 'sparkles', label: 'İlk Adım', unlocked: xp > 0 },
        { icon: 'trophy', label: 'Seviye 5', unlocked: level >= 5 },
        { icon: 'flame', label: '7 Gün Seri', unlocked: streakDays >= 7 },
        { icon: 'ribbon', label: '30 Gün Seri', unlocked: streakDays >= 30 },
    ];

    return (
        <Screen edges={['top']}>
            {/* Profile Header */}
            <View style={styles.headerTop}>
                <TouchableOpacity
                    style={styles.avatarWrap}
                    onPress={pickImage}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Profil fotoğrafını değiştir"
                >
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <AppText variant="hero" color={Colors.purpleLight}>
                                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                            </AppText>
                        </View>
                    )}
                    <View style={styles.cameraIcon}>
                        <Ionicons name="camera" size={14} color={Colors.textPrimary} />
                    </View>
                </TouchableOpacity>

                <AppText variant="title">{profile.name || 'Misafir'}</AppText>
                <View style={styles.signRow}>
                    <AppText variant="caption">
                        {profile.sunSign ? `${profile.sunSign} · ` : ''}Seviye {level}
                    </AppText>
                    {isPremium && (
                        <View style={styles.premiumInlineBadge}>
                            <Ionicons name="diamond" size={10} color={Colors.textOnAccent} />
                            <AppText variant="label" color={Colors.textOnAccent} style={styles.premiumInlineText}>
                                Premium
                            </AppText>
                        </View>
                    )}
                </View>
            </View>

            {/* Membership + Stats */}
            <Card glow style={styles.memberCard}>
                <View style={styles.memberRow}>
                    <View style={styles.memberInfo}>
                        <View style={[styles.memberBadge, isPremium ? styles.memberBadgePremium : styles.memberBadgeFree]}>
                            <Ionicons name={isPremium ? 'diamond' : 'person'} size={14} color={isPremium ? Colors.textOnAccent : Colors.textMuted} />
                            <AppText variant="label" color={isPremium ? Colors.textOnAccent : Colors.textMuted} style={styles.memberBadgeText}>
                                {isPremium ? 'Premium' : 'Ücretsiz'}
                            </AppText>
                        </View>
                        <AppText variant="caption">Üyelik</AppText>
                    </View>
                    <View style={styles.memberDivider} />
                    <View style={styles.memberInfo}>
                        <AppText variant="h1">{credits}</AppText>
                        <AppText variant="caption">Kredi</AppText>
                    </View>
                    <View style={styles.memberDivider} />
                    <View style={styles.memberInfo}>
                        <AppText variant="h1" color={Colors.warning}>{streakDays}</AppText>
                        <AppText variant="caption">Seri</AppText>
                    </View>
                </View>

                <View style={styles.xpHeader}>
                    <AppText variant="label">XP</AppText>
                    <AppText variant="caption">{xpInLevel} / 100</AppText>
                </View>
                <ProgressBar progress={xpInLevel / 100} />
            </Card>

            {/* Günlük Ücretsiz Kredi (ads disabled → honest free daily reward; no ad plays) */}
            <Card
                onPress={async () => {
                    const watchAd = useEntitlementsStore.getState().watchAd;
                    const result = await watchAd();
                    Alert.alert(
                        result.ok ? 'Tebrikler!' : 'Günlük Ödül',
                        result.ok
                            ? `${result.rewarded ?? 25} kredi kazandınız! Yarın tekrar gel.`
                            : result.message || 'Günlük ödül alınamadı, tekrar deneyin.'
                    );
                }}
                accessibilityLabel="Günlük ücretsiz kredini al, 25 kredi kazan"
                style={styles.adWatchCard}
            >
                <View style={styles.adWatchLeft}>
                    <Ionicons name="gift-outline" size={28} color={Colors.accentYellow} />
                    <View style={styles.adWatchTexts}>
                        <AppText variant="bodyStrong">Günlük Ücretsiz Kredi</AppText>
                        <AppText variant="caption">24 saatte bir 25 kredi kazan</AppText>
                    </View>
                </View>
                <View style={styles.adWatchBadge}>
                    <AppText variant="bodyStrong" color={Colors.textOnAccent}>+25</AppText>
                </View>
            </Card>

            {/* Bilgilerimi Düzenle — ilişki & iş durumu */}
            <Card style={styles.section} padded={false}>
                <Row
                    icon="create-outline"
                    title="Bilgilerimi Düzenle"
                    subtitle="İlişki durumu ve iş durumu — fallar bu bilgilere göre kişiselleşir"
                    onPress={() => {
                        setEditRelationship(profile.relationshipStatus || '');
                        setEditWork(profile.workStatus || '');
                        setEditVisible(true);
                    }}
                />
            </Card>

            {/* Premium Upgrade / Active
                Upgrade CTA is a purchase flow → hidden when purchases are disabled.
                The "Premium aktif" status card still shows for existing members. */}
            {!isPremium ? (
                Features.purchasesEnabled ? (
                <Card
                    onPress={() => setPremiumVisible(true)}
                    accessibilityLabel="Valeria Premium'a yükselt"
                    style={styles.upgradeCard}
                >
                    <View style={styles.upgradeLeft}>
                        <Ionicons name="star" size={24} color={Colors.accentYellow} />
                        <View style={styles.upgradeTexts}>
                            <AppText variant="h3" color={Colors.accentYellow}>Valeria Premium</AppText>
                            <AppText variant="caption">Günlük ücretsiz sorular, ekstra kredi, reklamsız deneyim</AppText>
                        </View>
                    </View>
                    <View style={styles.upgradeBtn}>
                        <AppText variant="bodyStrong" color={Colors.textOnAccent}>Yükselt</AppText>
                    </View>
                </Card>
                ) : null
            ) : (
                <Card style={styles.premiumActiveCard}>
                    <View style={styles.premiumActiveRow}>
                        <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                        <View style={styles.premiumActiveTexts}>
                            <AppText variant="h3" color={Colors.success}>Valeria Premium Aktif</AppText>
                            <AppText variant="caption">Günlük 2 ücretsiz soru · Aylık 800 kredi · Reklamsız</AppText>
                        </View>
                    </View>
                </Card>
            )}

            {/* Günlük Haklarım */}
            <AppText variant="label" style={styles.sectionLabel}>Günlük Haklarım</AppText>
            <Card style={styles.dailyCard}>
                <View style={styles.dailyMain}>
                    <AppText variant="hero" color={Colors.accentYellow}>{dailyQuestionsRemaining}</AppText>
                    <AppText variant="caption">Kalan ücretsiz soru</AppText>
                </View>
                <AppText variant="callout" center style={styles.dailyNote}>
                    {isPremium
                        ? 'Premium ile günde 2 ücretsiz soru hakkın var.'
                        : 'Premium ile günde 2 ücretsiz soru kazan.'}
                </AppText>
                <AppText variant="caption" center>
                    Her gün 00:00'da yenilenir ({getTimeUntilReset()})
                </AppText>
            </Card>

            {/* Başarımlar */}
            <AppText variant="label" style={styles.sectionLabel}>Başarımlar</AppText>
            <View style={styles.badges}>
                {achievements.map((a) => (
                    <View key={a.label} style={[styles.badge, a.unlocked && styles.badgeActive]}>
                        <Ionicons name={a.icon} size={24} color={a.unlocked ? Colors.accentYellow : Colors.textMuted} />
                        <AppText variant="caption" color={a.unlocked ? Colors.textSecondary : Colors.textMuted}>
                            {a.label}
                        </AppText>
                    </View>
                ))}
            </View>

            {/* Ayarlar */}
            <AppText variant="label" style={styles.sectionLabel}>Ayarlar</AppText>
            <Card padded={false} style={styles.groupCard}>
                {/* Kredi satın alma (IAP) devre dışı — App Store Guideline 3.1.1 */}
                {Features.purchasesEnabled && (
                    <>
                        <Row
                            icon="wallet-outline"
                            title="Kredi Yükle"
                            onPress={() => router.push('/buy-credits')}
                            accessibilityLabel="Kredi yükle"
                        />
                        <View style={styles.divider} />
                    </>
                )}
                <Row
                    icon="notifications-outline"
                    title="Bildirimler"
                    subtitle="Günlük fal ve hatırlatma bildirimleri"
                    accessibilityLabel="Bildirimleri aç veya kapat"
                    right={
                        notifBusy ? (
                            <ActivityIndicator color={Colors.accentYellow} />
                        ) : (
                            <Switch
                                value={notifEnabled}
                                onValueChange={handleToggleNotif}
                                trackColor={{ false: Colors.border, true: Colors.purple }}
                                thumbColor={notifEnabled ? Colors.accentYellow : Colors.textMuted}
                            />
                        )
                    }
                />
            </Card>

            {/* Hesap & Gizlilik */}
            <AppText variant="label" style={styles.sectionLabel}>Hesap & Gizlilik</AppText>
            <Card padded={false} style={styles.groupCard}>
                <Row
                    icon="document-text-outline"
                    title="Gizlilik Politikası"
                    onPress={() => Linking.openURL(Config.privacyUrl)}
                    accessibilityLabel="Gizlilik Politikasını aç"
                />
                <View style={styles.divider} />
                <Row
                    icon="shield-checkmark-outline"
                    title="Kullanım Şartları"
                    onPress={() => Linking.openURL(Config.termsUrl)}
                    accessibilityLabel="Kullanım Şartlarını aç"
                />
                <View style={styles.divider} />
                <Row
                    icon="trash-outline"
                    title="Hesabı Sil"
                    danger
                    onPress={() => router.push('/delete-account')}
                    accessibilityLabel="Hesabı sil"
                />
            </Card>

            {/* Logout */}
            <Button
                title="Çıkış Yap"
                variant="danger"
                icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
                style={styles.logoutBtn}
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
            />

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
                <AppText variant="caption" style={styles.disclaimerText}>{Config.disclaimer}</AppText>
            </View>

            {/* Bilgilerimi Düzenle Modal */}
            <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setEditVisible(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Kapat"
                        >
                            <Ionicons name="close" size={22} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <AppText variant="h2" style={styles.editTitle}>Bilgilerimi Düzenle</AppText>
                        <AppText variant="caption" color={Colors.textMuted} style={styles.editSub}>
                            Fallar ve yorumlar bu bilgilere göre kişiselleşir.
                        </AppText>

                        <AppText variant="label" color={Colors.purpleLight} style={styles.editLabel}>İlişki durumun</AppText>
                        <View style={styles.editGrid}>
                            {RELATIONSHIP_OPTIONS.map((o) => (
                                <Chip key={o.id} label={o.label} selected={editRelationship === o.id} onPress={() => setEditRelationship(o.id)} />
                            ))}
                        </View>

                        <AppText variant="label" color={Colors.purpleLight} style={styles.editLabel}>Çalışma durumun</AppText>
                        <View style={styles.editGrid}>
                            {WORK_OPTIONS.map((o) => (
                                <Chip key={o.id} label={o.label} selected={editWork === o.id} onPress={() => setEditWork(o.id)} />
                            ))}
                        </View>

                        <Button
                            title="Kaydet"
                            onPress={saveProfileEdit}
                            loading={savingEdit}
                            disabled={!editRelationship || !editWork}
                            style={styles.editSave}
                        />
                    </View>
                </View>
            </Modal>

            {/* Premium Modal */}
            <Modal visible={premiumVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setPremiumVisible(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Kapat"
                        >
                            <Ionicons name="close" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <Ionicons name="diamond" size={48} color={Colors.accentYellow} style={styles.modalIcon} />
                        <AppText variant="title" center>Valeria Premium</AppText>
                        <AppText variant="caption" center style={styles.modalSubtitle}>
                            Tüm özelliklere sınırsız erişim
                        </AppText>

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
                                    <AppText variant="callout" color={Colors.textSecondary}>{f.text}</AppText>
                                </View>
                            ))}
                        </View>

                        <View style={styles.planTabs}>
                            <TouchableOpacity
                                style={[styles.planTab, selectedPlan === 'monthly' && styles.planTabActive]}
                                onPress={() => setSelectedPlan('monthly')}
                                accessibilityRole="button"
                                accessibilityLabel="Aylık plan seç"
                            >
                                <AppText variant="label" color={selectedPlan === 'monthly' ? Colors.accentYellow : Colors.textMuted}>Aylık</AppText>
                                <AppText variant="title" color={selectedPlan === 'monthly' ? Colors.accentYellow : Colors.textPrimary} style={styles.planPrice}>₺99</AppText>
                                <AppText variant="caption">ayda</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.planTab, selectedPlan === 'yearly' && styles.planTabActive]}
                                onPress={() => setSelectedPlan('yearly')}
                                accessibilityRole="button"
                                accessibilityLabel="Yıllık plan seç"
                            >
                                <View style={styles.saveBadge}>
                                    <AppText variant="label" color={Colors.textPrimary} style={styles.saveBadgeText}>%25 Kazanç</AppText>
                                </View>
                                <AppText variant="label" color={selectedPlan === 'yearly' ? Colors.accentYellow : Colors.textMuted}>Yıllık</AppText>
                                <AppText variant="title" color={selectedPlan === 'yearly' ? Colors.accentYellow : Colors.textPrimary} style={styles.planPrice}>₺899</AppText>
                                <AppText variant="caption">yılda</AppText>
                            </TouchableOpacity>
                        </View>

                        {/* Purchase CTA hidden when in-app purchases are disabled */}
                        {Features.purchasesEnabled && (
                            <>
                                <Button
                                    title={purchasing ? 'İşleniyor...' : "Premium'a Yükselt"}
                                    loading={purchasing}
                                    onPress={handlePurchasePremium}
                                />

                                <AppText variant="caption" center style={styles.modalDisclaimer}>
                                    Abonelik, dönem sonunda otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz.
                                </AppText>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: Colors.purpleA25,
        alignItems: 'center', justifyContent: 'center',
    },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.purple,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: Colors.backgroundDark,
    },
    signRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
    premiumInlineBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: Colors.accentYellow, paddingHorizontal: Spacing.sm, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    premiumInlineText: { letterSpacing: 0.3 },

    // Member Card
    memberCard: { marginBottom: Spacing.lg },
    memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    memberInfo: { alignItems: 'center', gap: 4 },
    memberDivider: { width: 1, height: 32, backgroundColor: Colors.border },
    memberBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full,
    },
    memberBadgePremium: { backgroundColor: Colors.accentYellow },
    memberBadgeFree: { backgroundColor: Colors.whiteA08 },
    memberBadgeText: { letterSpacing: 0.3 },
    xpHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: Spacing.lg, marginBottom: Spacing.sm,
    },

    // Ad Watch
    section: { marginBottom: Spacing.lg },
    adWatchCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderColor: Colors.borderAccent, marginBottom: Spacing.md,
    },
    adWatchLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
    adWatchTexts: { flex: 1 },
    adWatchBadge: {
        backgroundColor: Colors.accentYellow, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    },

    // Upgrade Card
    upgradeCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.purpleA15, borderColor: Colors.borderAccent, marginBottom: Spacing.xl,
    },
    upgradeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    upgradeTexts: { flex: 1 },
    upgradeBtn: {
        backgroundColor: Colors.accentYellow, paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    },

    // Premium Active
    premiumActiveCard: { marginBottom: Spacing.xl, borderColor: Colors.success },
    premiumActiveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    premiumActiveTexts: { flex: 1 },

    // Section labels
    sectionLabel: { marginBottom: Spacing.md, marginTop: Spacing.xs },

    // Daily
    dailyCard: { marginBottom: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
    dailyMain: { alignItems: 'center' },
    dailyNote: { marginTop: Spacing.xs },

    // Badges
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
    badge: {
        width: '47%', alignItems: 'center', paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg, backgroundColor: Colors.surface1,
        borderWidth: 1, borderColor: Colors.border, gap: Spacing.xs, opacity: 0.5,
    },
    badgeActive: { opacity: 1, borderColor: Colors.borderAccent },

    // Grouped list cards
    groupCard: { marginBottom: Spacing.xl },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 56,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    rowTexts: { flex: 1 },
    divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },

    // Logout
    logoutBtn: { marginTop: Spacing.sm },

    // Disclaimer
    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        marginTop: Spacing.xl, marginBottom: Spacing.xxl,
    },
    disclaimerText: { flex: 1 },

    // Bilgilerimi Düzenle
    editTitle: { marginTop: Spacing.sm },
    editSub: { marginTop: 2, marginBottom: Spacing.lg },
    editLabel: { marginBottom: Spacing.sm, marginTop: Spacing.md },
    editGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    editSave: { marginTop: Spacing.xl },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: Colors.scrim, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: Colors.backgroundModal, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
        padding: Spacing.xl, paddingBottom: Spacing.huge,
    },
    modalClose: { position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 1 },
    modalIcon: { alignSelf: 'center', marginBottom: Spacing.md },
    modalSubtitle: { marginBottom: Spacing.lg },

    // Features
    featureList: { marginBottom: Spacing.lg },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },

    // Plan Tabs
    planTabs: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
    planTab: {
        flex: 1, alignItems: 'center', paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: Colors.border, position: 'relative',
    },
    planTabActive: { borderColor: Colors.accentYellow, backgroundColor: Colors.goldA12 },
    planPrice: { marginVertical: 2 },
    saveBadge: {
        position: 'absolute', top: -10,
        backgroundColor: Colors.success, paddingHorizontal: Spacing.sm, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    saveBadgeText: { letterSpacing: 0.2 },
    modalDisclaimer: { marginTop: Spacing.md },
});
