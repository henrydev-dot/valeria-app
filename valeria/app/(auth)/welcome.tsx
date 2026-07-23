import React from 'react';
import { View, StyleSheet, Image, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, AppText, Button } from '../../src/components';
import { Colors, Gradients } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Config } from '../../src/config';

const FEATURES = [
    {
        icon: 'sparkles' as const,
        title: 'Kişisel Tanrı Arketipin',
        desc: '12 soruluk yolculukla seni yansıtan Yunan tanrı arketipini keşfet.',
    },
    {
        icon: 'planet' as const,
        title: 'Gerçek Doğum Haritası',
        desc: 'Güneş, Ay ve Yükselen burcun gerçek gök hesaplamalarıyla çıkar.',
    },
    {
        icon: 'cafe' as const,
        title: 'AI Destekli Fal',
        desc: 'Tarot, kahve falı ve sorularına sana özel, kişiselleştirilmiş yorumlar.',
    },
];

export default function WelcomeScreen() {
    return (
        <GradientBackground>
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.hero}>
                    <LinearGradient colors={Gradients.gold} style={styles.logo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name="moon" size={40} color={Colors.textOnAccent} />
                    </LinearGradient>
                    <AppText variant="hero" center style={styles.brand}>Valeria</AppText>
                    <AppText variant="body" center color={Colors.textSecondary} style={styles.tagline}>
                        Yıldızların, arketiplerin ve sezginin buluştuğu kişisel rehberin.
                    </AppText>
                </View>

                <View style={styles.features}>
                    {FEATURES.map((f) => (
                        <View key={f.title} style={styles.featureRow}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={f.icon} size={22} color={Colors.accentYellow} />
                            </View>
                            <View style={styles.featureText}>
                                <AppText variant="h3">{f.title}</AppText>
                                <AppText variant="caption" style={styles.featureDesc}>{f.desc}</AppText>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Button title="Yolculuğa Başla" onPress={() => router.push('/(auth)/login?mode=register')} />
                    <Button
                        title="Zaten hesabım var"
                        variant="ghost"
                        onPress={() => router.push('/(auth)/login?mode=login')}
                        style={styles.secondaryBtn}
                    />
                    <AppText variant="caption" center color={Colors.textMuted} style={styles.legal}>
                        Devam ederek{' '}
                        <AppText variant="caption" color={Colors.purpleLight} onPress={() => Linking.openURL(Config.termsUrl)}>
                            Kullanım Şartları
                        </AppText>{' '}
                        ve{' '}
                        <AppText variant="caption" color={Colors.purpleLight} onPress={() => Linking.openURL(Config.privacyUrl)}>
                            Gizlilik Politikası
                        </AppText>
                        'nı kabul etmiş olursun.
                    </AppText>
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, paddingHorizontal: Spacing.xl },
    hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logo: {
        width: 88, height: 88, borderRadius: BorderRadius.xxl,
        alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
    },
    brand: { marginBottom: Spacing.sm },
    tagline: { paddingHorizontal: Spacing.lg },
    features: { gap: Spacing.lg, marginBottom: Spacing.xxl },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    featureIcon: {
        width: 48, height: 48, borderRadius: BorderRadius.md,
        backgroundColor: Colors.goldA12, alignItems: 'center', justifyContent: 'center',
    },
    featureText: { flex: 1 },
    featureDesc: { marginTop: 2 },
    footer: { paddingBottom: Spacing.sm },
    secondaryBtn: { marginTop: Spacing.md },
    legal: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
});
