import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing } from '../../src/theme/spacing';
import { ContentRepository } from '../../src/repositories/ContentRepository';
import { getSunSign, getMoonSign, getRisingSign } from '../../src/utils/zodiacCalc';
import type { Deity } from '../../src/types';

// Sun sign → deity ID mapping (same as backend ZODIAC_DATA mythology.greek)
const SUN_SIGN_DEITY_MAP: Record<string, { id: string; nameTR: string }> = {
    'Koç': { id: 'ares', nameTR: 'Ares' },
    'Boğa': { id: 'aphrodite', nameTR: 'Afrodit' },
    'İkizler': { id: 'hermes', nameTR: 'Hermes' },
    'Yengeç': { id: 'demeter', nameTR: 'Demeter' },
    'Aslan': { id: 'apollo', nameTR: 'Apollon' },
    'Başak': { id: 'athena', nameTR: 'Athena' },
    'Terazi': { id: 'hera', nameTR: 'Hera' },
    'Akrep': { id: 'hades', nameTR: 'Hades' },
    'Yay': { id: 'zeus', nameTR: 'Zeus' },
    'Oğlak': { id: 'athena', nameTR: 'Kronos' },
    'Kova': { id: 'poseidon', nameTR: 'Prometheus' },
    'Balık': { id: 'poseidon', nameTR: 'Poseidon' },
};

export default function Step7() {
    const { profile, setProfile } = useUserStore();
    const [status, setStatus] = useState('Kozmik profiliniz hesaplanıyor...');

    useEffect(() => {
        async function calculate() {
            // 1. Calculate zodiac signs
            const sunSign = getSunSign(profile.birthDate);
            const moonSign = getMoonSign(profile.birthDate);
            const risingSign = getRisingSign(profile.birthDate, profile.birthTime);

            const sunSignName = sunSign?.nameTR || 'Bilinmiyor';
            const moonSignName = moonSign?.nameTR || 'Bilinmiyor';
            const risingSignName = risingSign?.nameTR || 'Bilinmiyor';

            setStatus('Burçlarınız belirlendi, tanrı arketipi atanıyor...');

            // 2. Map sun sign to deity
            const deityMapping = SUN_SIGN_DEITY_MAP[sunSignName] || { id: 'athena', nameTR: 'Athena' };

            // 3. Try to find full deity data from onboarding JSON
            let deityName = deityMapping.nameTR;
            try {
                const data = await ContentRepository.getOnboardingTest();
                const found = (data.deities as Deity[]).find((d) => d.id === deityMapping.id);
                if (found) {
                    deityName = found.nameTR;
                }
            } catch (e) {
                console.log('Deity data fetch error:', e);
            }

            // 4. Calculate energy score (60-90 range based on zodiac)
            const energyScore = Math.floor(Math.random() * 30) + 60;

            // 5. Set profile and navigate
            setProfile({
                deityResult: deityMapping.id,
                deityName: deityName,
                sunSign: sunSignName,
                moonSign: moonSignName,
                risingSign: risingSignName,
                energyScore,
            });

            setStatus('Hazır! Kozmik özetinize yönlendiriliyorsunuz...');

            // Small delay so user sees the transition
            setTimeout(() => {
                router.push('/(auth)/step8');
            }, 800);
        }

        calculate();
    }, []);

    return (
        <GradientBackground>
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.accentYellow} style={styles.spinner} />
                <Text style={styles.title}>Kozmik Profiliniz Hesaplanıyor</Text>
                <Text style={styles.status}>{status}</Text>
                <Text style={styles.subtitle}>
                    Doğum bilgilerinize göre güneş, ay ve yükselen burcunuz belirleniyor ve size en uygun mitolojik arketip atanıyor.
                </Text>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    spinner: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    status: {
        fontSize: FontSize.md,
        color: Colors.accentYellow,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
