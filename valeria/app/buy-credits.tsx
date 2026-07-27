import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button, AppText, EmptyState } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import * as api from '../src/api';
import { Features } from '../src/config';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

// react-native-iap yalnız native build'de vardır (Expo Go'da yok) — koşullu yükle.
let RNIap: any = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNIap = require('react-native-iap');
} catch {
    RNIap = null;
}

// App Store Connect'te bu ID'lerle CONSUMABLE ürünler tanımlanmalı.
// Kredi karşılıkları SUNUCUDA (CREDIT_PACKAGES) belirlenir — buradakiler vitrindir.
interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    fallbackPrice: string;
    popular?: boolean;
}

const PACKAGES: CreditPackage[] = [
    { id: 'valeria_credits_250', name: 'Başlangıç', credits: 250, fallbackPrice: '₺39,99' },
    { id: 'valeria_credits_500', name: 'Standart', credits: 500, fallbackPrice: '₺99,99', popular: true },
    { id: 'valeria_credits_1000', name: 'Premium', credits: 1000, fallbackPrice: '₺179,99' },
];
const PRODUCT_IDS = PACKAGES.map((p) => p.id);

export default function BuyCreditsScreen() {
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const [pending, setPending] = useState<string | null>(null);
    const [storeReady, setStoreReady] = useState(false);
    // App Store'dan gelen yerelleştirilmiş fiyatlar (productId → "₺39,99")
    const [storePrices, setStorePrices] = useState<Record<string, string>>({});
    const listenersRef = useRef<any[]>([]);

    // Paid Apps sözleşmesi tamamlanana kadar satın alma kapalı (Features bayrağı).
    // Bayrak kapalıyken IAP bağlantısı hiç kurulmaz ve paket listesi gösterilmez.
    const iapAvailable = !!Features.purchasesEnabled && !!RNIap && Platform.OS === 'ios';

    useEffect(() => {
        if (!iapAvailable) return;
        let mounted = true;

        (async () => {
            try {
                await RNIap.initConnection();
                const products = await RNIap.getProducts({ skus: PRODUCT_IDS });
                if (!mounted) return;
                const prices: Record<string, string> = {};
                for (const pr of products || []) {
                    prices[pr.productId] = pr.localizedPrice || pr.price;
                }
                setStorePrices(prices);
                setStoreReady(true);
            } catch (e: any) {
                console.warn('IAP init failed:', e?.message);
            }
        })();

        // Satın alma tamamlanınca: makbuz SUNUCUDA doğrulanır → kredi sunucudan
        // eklenir → ancak ondan sonra işlem bitirilir (finishTransaction).
        // Doğrulama başarısızsa işlem açık kalır; StoreKit sonraki açılışta
        // yeniden bildirir, kredi kaybolmaz.
        const purchaseSub = RNIap.purchaseUpdatedListener(async (purchase: any) => {
            const receipt = purchase?.transactionReceipt;
            if (!receipt) return;
            try {
                const res = await api.entitlements.verifyPurchase(
                    receipt,
                    purchase.productId,
                    purchase.transactionId
                );
                await RNIap.finishTransaction({ purchase, isConsumable: true });
                await refreshEnt();
                Alert.alert(
                    'Satın Alma Başarılı',
                    `${res.added ?? ''} kredi hesabına eklendi. Yeni bakiye: ${res.credits}`,
                    [{ text: 'Harika!', onPress: () => router.back() }]
                );
            } catch (e: any) {
                Alert.alert(
                    'Doğrulama Bekliyor',
                    e?.message || 'Ödeme alındı ama doğrulama tamamlanamadı. Krediler kısa süre içinde hesabına yansıyacak.'
                );
            } finally {
                setPending(null);
            }
        });

        const errorSub = RNIap.purchaseErrorListener((error: any) => {
            setPending(null);
            // Kullanıcı vazgeçtiyse sessiz kal
            if (error?.code !== 'E_USER_CANCELLED') {
                Alert.alert('Satın Alma Hatası', error?.message || 'İşlem tamamlanamadı.');
            }
        });

        listenersRef.current = [purchaseSub, errorSub];

        return () => {
            mounted = false;
            listenersRef.current.forEach((s) => s?.remove?.());
            RNIap.endConnection().catch(() => { });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iapAvailable]);

    const handlePurchase = async (pkg: CreditPackage) => {
        if (!iapAvailable) {
            Alert.alert(
                'Satın Alma Kullanılamıyor',
                'Kredi satın alma yalnızca App Store sürümünde çalışır.'
            );
            return;
        }
        if (pending) return;
        setPending(pkg.id);
        try {
            await RNIap.requestPurchase({ sku: pkg.id });
            // Sonuç purchaseUpdatedListener'a düşer.
        } catch (e: any) {
            setPending(null);
            if (e?.code !== 'E_USER_CANCELLED') {
                Alert.alert('Hata', e?.message || 'Satın alma başlatılamadı');
            }
        }
    };

    // Satın alma bayrağı kapalıyken zarif bir "çok yakında" ekranı göster;
    // IAP kodu aşağıda hazır bekler, bayrak açılınca yeni build ile aktifleşir.
    if (!Features.purchasesEnabled) {
        return (
            <Screen>
                <Header
                    title="Kredi Yükle"
                    showBack={false}
                    right={
                        <Ionicons
                            name="close"
                            size={28}
                            color={Colors.textPrimary}
                            onPress={() => router.back()}
                            accessibilityRole="button"
                            accessibilityLabel="Kapat"
                        />
                    }
                />

                <Card glow style={styles.balanceCard}>
                    <AppText variant="label" center>Mevcut Bakiye</AppText>
                    <AppText variant="hero" center color={Colors.accentYellow} style={styles.balanceValue}>
                        {credits} Kredi
                    </AppText>
                </Card>

                <EmptyState
                    icon={<Ionicons name="sparkles" size={40} color={Colors.accentYellow} />}
                    title="Kredi satın alma çok yakında"
                    message="Şimdilik tüm krediler ücretsiz kazanılıyor: her gün profil sayfandan günlük hediyeni topla."
                    actionLabel="Anladım"
                    onAction={() => router.back()}
                />
            </Screen>
        );
    }

    return (
        <Screen>
            <Header
                title="Kredi Yükle"
                showBack={false}
                right={
                    <Ionicons
                        name="close"
                        size={28}
                        color={Colors.textPrimary}
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Kapat"
                    />
                }
            />

            {/* Bakiye */}
            <Card glow style={styles.balanceCard}>
                <AppText variant="label" center>Mevcut Bakiye</AppText>
                <AppText variant="hero" center color={Colors.accentYellow} style={styles.balanceValue}>
                    {credits} Kredi
                </AppText>
            </Card>

            <AppText variant="h1" style={styles.sectionTitle}>Paketler</AppText>
            <AppText variant="caption" style={styles.sectionSubtitle}>
                Ödeme, Apple hesabın üzerinden güvenle alınır.
            </AppText>

            {PACKAGES.map((pkg) => {
                const price = storePrices[pkg.id] || pkg.fallbackPrice;
                const busy = pending === pkg.id;
                return (
                    <Card
                        key={pkg.id}
                        style={[styles.pkgCard, pkg.popular && styles.pkgPopular]}
                        onPress={() => handlePurchase(pkg)}
                        accessibilityLabel={`${pkg.name}: ${pkg.credits} kredi, ${price}`}
                    >
                        {pkg.popular && (
                            <View style={styles.popularBadge}>
                                <AppText variant="label" color={Colors.textOnAccent}>EN POPÜLER</AppText>
                            </View>
                        )}
                        <View style={styles.pkgRow}>
                            <View style={styles.pkgIcon}>
                                <Ionicons name="diamond" size={24} color={Colors.accentYellow} />
                            </View>
                            <View style={styles.pkgInfo}>
                                <AppText variant="h3">{pkg.credits} Kredi</AppText>
                                <AppText variant="caption" color={Colors.textMuted}>{pkg.name} paketi</AppText>
                            </View>
                            <Button
                                title={busy ? ' ' : price}
                                loading={busy}
                                onPress={() => handlePurchase(pkg)}
                                size="sm"
                                fullWidth={false}
                            />
                        </View>
                    </Card>
                );
            })}

            {!iapAvailable && (
                <Card style={styles.warnCard}>
                    <View style={styles.warnRow}>
                        <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
                        <AppText variant="caption" color={Colors.textSecondary} style={styles.warnText}>
                            Bu ortamda mağaza bağlantısı yok — satın alma, App Store'dan indirilen
                            sürümde aktiftir.
                        </AppText>
                    </View>
                </Card>
            )}

            {iapAvailable && !storeReady && (
                <AppText variant="caption" color={Colors.textMuted} center style={styles.loadingNote}>
                    Mağaza fiyatları yükleniyor...
                </AppText>
            )}

            <AppText variant="caption" color={Colors.textMuted} style={styles.legal}>
                Krediler iade edilmez ve yalnızca Valeria içinde kullanılır. Satın alma,
                Apple kimliğinle ilişkili ödeme yöntemiyle tahsil edilir.
            </AppText>
        </Screen>
    );
}

const styles = StyleSheet.create({
    balanceCard: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
    balanceValue: { marginTop: Spacing.xs },
    sectionTitle: { marginBottom: 2 },
    sectionSubtitle: { marginBottom: Spacing.lg },
    pkgCard: { marginBottom: Spacing.md },
    pkgPopular: { borderColor: Colors.borderAccent, borderWidth: 1.5 },
    popularBadge: {
        position: 'absolute', top: -1, right: Spacing.lg,
        backgroundColor: Colors.accentYellow,
        paddingHorizontal: Spacing.md, paddingVertical: 3,
        borderBottomLeftRadius: BorderRadius.sm, borderBottomRightRadius: BorderRadius.sm,
    },
    pkgRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    pkgIcon: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: Colors.goldA12,
        alignItems: 'center', justifyContent: 'center',
    },
    pkgInfo: { flex: 1, gap: 2 },
    warnCard: { marginTop: Spacing.md },
    warnRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
    warnText: { flex: 1 },
    loadingNote: { marginTop: Spacing.sm },
    legal: { marginTop: Spacing.xl, lineHeight: 18 },
});
