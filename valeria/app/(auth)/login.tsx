import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Button, Field } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Config } from '../../src/config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const params = useLocalSearchParams<{ mode?: string }>();
    const [mode, setMode] = useState<'login' | 'register'>(params.mode === 'register' ? 'register' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [appleAvailable, setAppleAvailable] = useState(false);
    const { login, register, appleLogin } = useUserStore();
    const loadEnt = useEntitlementsStore((s) => s.load);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
        }
    }, []);

    const validate = () => {
        const e: { email?: string; password?: string } = {};
        if (!EMAIL_RE.test(email.trim())) e.email = 'Geçerli bir e-posta girin';
        if (password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const routeAfterAuth = (onboardingComplete: boolean) => {
        router.replace(onboardingComplete ? '/(tabs)' : '/(auth)/step1');
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            if (mode === 'login') {
                const result = await login(email.trim(), password);
                await loadEnt();
                routeAfterAuth(result.onboardingComplete);
            } else {
                await register(email.trim(), password, '');
                await loadEnt();
                router.replace('/(auth)/step1');
            }
        } catch (e: any) {
            Alert.alert('Bir sorun oluştu', e?.message || 'Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            const appleName = credential.fullName
                ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
                : undefined;
            const result = await appleLogin(credential.user, credential.email || undefined, appleName);
            await loadEnt();
            routeAfterAuth(result.onboardingComplete);
        } catch (e: any) {
            if (e.code !== 'ERR_REQUEST_CANCELED') {
                Alert.alert('Apple ile giriş başarısız', e?.message || 'Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = () => {
        Alert.alert(
            'Şifre Sıfırlama',
            `Şifreni sıfırlamak için ${Config.supportEmail} adresine e-posta gönder; hesabına bağlı sıfırlama bağlantısını ileteceğiz.`
        );
    };

    return (
        <Screen keyboard padded>
            <View style={styles.logoRow}>
                <Ionicons name="moon" size={36} color={Colors.accentYellow} />
            </View>
            <AppText variant="title" center>{mode === 'login' ? 'Tekrar hoş geldin' : 'Hesabını oluştur'}</AppText>
            <AppText variant="body" center color={Colors.textSecondary} style={styles.subtitle}>
                {mode === 'login' ? 'Kozmik yolculuğuna kaldığın yerden devam et.' : 'Sana özel deneyimin için birkaç saniye yeter.'}
            </AppText>

            <View style={styles.form}>
                <Field
                    label="E-posta"
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email}
                    icon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
                />
                <Field
                    label="Şifre"
                    placeholder="En az 6 karakter"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                    icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />}
                />
                {mode === 'login' ? (
                    <AppText variant="caption" color={Colors.purpleLight} onPress={handleForgot} style={styles.forgot}>
                        Şifreni mi unuttun?
                    </AppText>
                ) : null}
            </View>

            <Button
                title={mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                onPress={handleSubmit}
                loading={loading}
            />

            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <AppText variant="caption" style={styles.dividerText}>veya</AppText>
                <View style={styles.dividerLine} />
            </View>

            {appleAvailable ? (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={
                        mode === 'login'
                            ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    }
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                    cornerRadius={BorderRadius.lg}
                    style={styles.appleBtn}
                    onPress={handleAppleSignIn}
                />
            ) : null}

            <AppText
                variant="callout"
                center
                color={Colors.purpleLight}
                onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={styles.switch}
            >
                {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
            </AppText>

            <AppText variant="caption" center color={Colors.textMuted} style={styles.legal}>
                Devam ederek{' '}
                <AppText variant="caption" color={Colors.purpleLight} onPress={() => Linking.openURL(Config.termsUrl)}>Kullanım Şartları</AppText>
                {' '}ve{' '}
                <AppText variant="caption" color={Colors.purpleLight} onPress={() => Linking.openURL(Config.privacyUrl)}>Gizlilik Politikası</AppText>
                'nı kabul edersin.
            </AppText>
        </Screen>
    );
}

const styles = StyleSheet.create({
    logoRow: { alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.md },
    subtitle: { marginTop: Spacing.sm, marginBottom: Spacing.xl },
    form: { marginBottom: Spacing.sm },
    forgot: { alignSelf: 'flex-end', marginTop: -Spacing.sm },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { marginHorizontal: Spacing.md },
    appleBtn: { height: 52, width: '100%' },
    switch: { marginTop: Spacing.xl },
    legal: { marginTop: Spacing.xl, paddingHorizontal: Spacing.md },
});
