import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, Card, Button, AppText } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import * as api from '../src/api';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

interface CreditPackage {
    name: string;
    credits: number;
    price: string;
    popular?: boolean;
}

const PACKAGES: CreditPackage[] = [
    { name: 'Başlangıç', credits: 150, price: '10 TL' },
    { name: 'Standart', credits: 1000, price: '50 TL', popular: true },
    { name: 'Premium', credits: 2500, price: '100 TL' },
    { name: 'Mega', credits: 6000, price: '500 TL' },
];

export default function BuyCreditsScreen() {
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);
    const [pending, setPending] = useState<string | null>(null);

    const grantCredits = async (pkg: CreditPackage) => {
        setPending(pkg.name);
        try {
            await api.entitlements.addCredits(pkg.credits, pkg.name);
            await refreshEnt();
            Alert.alert(
                'Başarılı',
                `${pkg.credits} kredi hesabınıza eklendi!`,
                [{ text: 'Tamam', onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Satın alma başarısız');
        } finally {
            setPending(null);
        }
    };

    const handlePurchase = (pkg: CreditPackage) => {
        // Gate behind an explicit confirmation. This is a simulation, not a real
        // payment — the disclaimer stays honest and the dialog makes it deliberate.
        Alert.alert(
            'Satın Almayı Onayla',
            `${pkg.name} paketi (${pkg.credits} kredi) — ${pkg.price}\n\nBu bir demo simülasyonudur; gerçek bir ödeme alınmaz. Devam etmek istiyor musunuz?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Onayla', onPress: () => grantCredits(pkg) },
            ]
        );
    };

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

            <AppText variant="h1" style={styles.sectionTitle}>Paketler</AppText>
            <AppText variant="caption" style={styles.sectionSubtitle}>
                Demo modunda ücretler simüle edilmektedir; gerçek bir ödeme alınmaz.
            </AppText>

            {PACKAGES.map((pkg) => (
                <Card
                    key={pkg.name}
                    style={pkg.popular ? { ...styles.packageCard, ...styles.popularCard } : styles.packageCard}
                >
                    {pkg.popular && (
                        <View style={styles.popularBadge}>
                            <AppText variant="label" color={Colors.textOnAccent} style={styles.popularText}>
                                En Popüler
                            </AppText>
                        </View>
                    )}
                    <View style={styles.packageRow}>
                        <View style={styles.packageInfo}>
                            <AppText variant="h3">{pkg.name}</AppText>
                            <AppText variant="callout" color={Colors.purpleLight} style={styles.packageCredits}>
                                {pkg.credits} kredi
                            </AppText>
                        </View>
                        <View style={styles.packageRight}>
                            <AppText variant="bodyStrong" style={styles.packagePrice}>{pkg.price}</AppText>
                            <Button
                                title="Satın Al"
                                size="sm"
                                fullWidth={false}
                                loading={pending === pkg.name}
                                disabled={pending !== null && pending !== pkg.name}
                                onPress={() => handlePurchase(pkg)}
                            />
                        </View>
                    </View>
                </Card>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    balanceCard: {
        alignItems: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    balanceValue: {
        marginTop: Spacing.xs,
    },
    sectionTitle: {
        marginBottom: Spacing.xs,
    },
    sectionSubtitle: {
        marginBottom: Spacing.xl,
    },
    packageCard: {
        marginBottom: Spacing.md,
    },
    popularCard: {
        borderColor: Colors.borderAccent,
    },
    popularBadge: {
        position: 'absolute',
        top: -1,
        right: 12,
        backgroundColor: Colors.accentYellow,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderBottomLeftRadius: BorderRadius.sm,
        borderBottomRightRadius: BorderRadius.sm,
    },
    popularText: {
        letterSpacing: 0,
    },
    packageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageInfo: {
        flex: 1,
    },
    packageCredits: {
        marginTop: 2,
    },
    packageRight: {
        alignItems: 'flex-end',
        gap: Spacing.sm,
    },
    packagePrice: {
        color: Colors.textSecondary,
    },
});
