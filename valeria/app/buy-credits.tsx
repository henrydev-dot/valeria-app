import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, KismetCard, PrimaryButton } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import * as api from '../src/api';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';

const PACKAGES = [
    { name: 'Başlangıç', credits: 150, price: '10 TL' },
    { name: 'Standart', credits: 1000, price: '50 TL', popular: true },
    { name: 'Premium', credits: 2500, price: '100 TL' },
    { name: 'Mega', credits: 6000, price: '500 TL' },
];

export default function BuyCreditsScreen() {
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
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
        }
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Kredi Yukle</Text>
                    <View style={{ width: 28 }} />
                </View>

                <KismetCard glow style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
                    <Text style={styles.balanceValue}>{credits} Kredi</Text>
                </KismetCard>

                <Text style={styles.sectionTitle}>Paketler</Text>
                <Text style={styles.sectionSubtitle}>
                    MVP demo modunda ucretler simule edilmektedir.
                </Text>

                {PACKAGES.map((pkg) => (
                    <KismetCard
                        key={pkg.name}
                        style={pkg.popular ? { ...styles.packageCard, ...styles.popularCard } : styles.packageCard}
                    >
                        {pkg.popular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>En Populer</Text>
                            </View>
                        )}
                        <View style={styles.packageRow}>
                            <View>
                                <Text style={styles.packageName}>{pkg.name}</Text>
                                <Text style={styles.packageCredits}>{pkg.credits} kredi</Text>
                            </View>
                            <View style={styles.packageRight}>
                                <Text style={styles.packagePrice}>{pkg.price}</Text>
                                <TouchableOpacity
                                    style={styles.buyBtn}
                                    onPress={() => handlePurchase(pkg)}
                                >
                                    <Text style={styles.buyBtnText}>Satin Al</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KismetCard>
                ))}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        paddingTop: 40,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    balanceCard: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    balanceLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    balanceValue: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.accentYellow,
    },
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    sectionSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xl,
    },
    packageCard: {
        marginBottom: Spacing.md,
    },
    popularCard: {
        borderColor: Colors.accentYellow + '50',
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
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.backgroundDark,
    },
    packageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageName: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    packageCredits: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
        marginTop: 2,
    },
    packageRight: {
        alignItems: 'flex-end',
        gap: Spacing.sm,
    },
    packagePrice: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    buyBtn: {
        backgroundColor: Colors.accentYellow,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    buyBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.backgroundDark,
    },
});
