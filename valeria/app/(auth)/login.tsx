import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register, appleLogin } = useUserStore();
    const loadEnt = useEntitlementsStore((s) => s.load);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Hata', 'Email ve şifre gerekli');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                const result = await login(email.trim(), password.trim());
                await loadEnt();
                if (result.onboardingComplete) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)/step1');
                }
            } else {
                await register(email.trim(), password.trim(), '');
                await loadEnt();
                router.replace('/(auth)/step1');
            }
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Bir hata oluştu');
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

            const appleId = credential.user;
            const appleEmail = credential.email || undefined;
            const appleName = credential.fullName
                ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
                : undefined;

            const result = await appleLogin(appleId, appleEmail, appleName);
            await loadEnt();

            if (result.onboardingComplete) {
                router.replace('/(tabs)');
            } else {
                router.replace('/(auth)/step1');
            }
        } catch (e: any) {
            if (e.code !== 'ERR_REQUEST_CANCELED') {
                Alert.alert('Hata', e.message || 'Apple ile giriş başarısız');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    <View style={styles.logoRow}>
                        <Ionicons name="moon" size={40} color={Colors.accentYellow} />
                    </View>
                    <Text style={styles.title}>Valeria</Text>
                    <Text style={styles.subtitle}>
                        {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={Colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        placeholderTextColor={Colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
                <View style={styles.footer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.accentYellow} />
                    ) : (
                        <>
                            <PrimaryButton
                                title={mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                                onPress={handleSubmit}
                                disabled={!email.trim() || !password.trim()}
                            />

                            {/* Divider */}
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>veya</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Apple Sign In */}
                            <TouchableOpacity style={styles.appleBtn} onPress={handleAppleSignIn}>
                                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                                <Text style={styles.appleBtnText}>
                                    {mode === 'login' ? 'Apple ile Giriş Yap' : 'Apple ile Kayıt Ol'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchBtn}
                                onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                            >
                                <Text style={styles.switchText}>
                                    {mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    logoRow: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xxxl,
    },
    input: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    footer: {
        paddingBottom: Spacing.huge,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginHorizontal: Spacing.md,
    },
    appleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        borderRadius: BorderRadius.lg,
        paddingVertical: 14,
        gap: 8,
    },
    appleBtnText: {
        color: '#FFFFFF',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    switchBtn: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    switchText: {
        fontSize: FontSize.sm,
        color: Colors.purpleLight,
    },
});

