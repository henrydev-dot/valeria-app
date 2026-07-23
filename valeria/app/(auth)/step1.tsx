import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

export default function Step1() {
    const [name, setName] = useState('');
    const setProfile = useUserStore((s) => s.setProfile);

    const handleNext = () => {
        if (name.trim().length < 2) return;
        setProfile({ name: name.trim() });
        router.push('/(auth)/step2');
    };

    return (
        <GradientBackground>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    <Text style={styles.step}>1 / 8</Text>
                    <Text style={styles.title}>Adınız ve Soyadınız</Text>
                    <Text style={styles.subtitle}>
                        Size özel kozmik analizler hazırlayabilmemiz için adınızı öğrenelim.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ad Soyad"
                        placeholderTextColor={Colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        returnKeyType="next"
                        onSubmitEditing={handleNext}
                    />
                </View>
                <View style={styles.footer}>
                    <PrimaryButton
                        title="Devam Et"
                        onPress={handleNext}
                        disabled={name.trim().length < 2}
                    />
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
    step: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxxl,
        lineHeight: 22,
    },
    input: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.lg,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    footer: {
        paddingBottom: Spacing.huge,
    },
});
