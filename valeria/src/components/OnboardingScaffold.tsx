import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Keyboard, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from './GradientBackground';
import { AppText } from './AppText';
import { Button } from './Button';
import { ProgressBar } from './Feedback';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface OnboardingScaffoldProps {
    /** 1-based step index. */
    step: number;
    totalSteps: number;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    ctaLabel?: string;
    onNext?: () => void;
    nextDisabled?: boolean;
    loading?: boolean;
    onBack?: () => void;
    showBack?: boolean;
    /** Render children in a scroll view (default true). */
    scroll?: boolean;
    footerNote?: React.ReactNode;
}

/**
 * Unified onboarding step frame: consistent safe-area, back button, progress
 * bar, title block, and a pinned footer CTA. Every step uses this.
 */
export function OnboardingScaffold({
    step,
    totalSteps,
    title,
    subtitle,
    children,
    ctaLabel = 'Devam Et',
    onNext,
    nextDisabled,
    loading,
    onBack,
    showBack = true,
    scroll = true,
    footerNote,
}: OnboardingScaffoldProps) {
    const router = useRouter();
    const handleBack = onBack || (() => router.back());

    const Body = scroll ? ScrollView : View;

    return (
        <GradientBackground>
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    {showBack ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={styles.backBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Geri"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.backBtn} />
                    )}
                    <View style={styles.progressWrap}>
                        <ProgressBar progress={step / totalSteps} />
                    </View>
                    <AppText variant="label" color={Colors.textMuted} style={styles.stepText}>
                        {step}/{totalSteps}
                    </AppText>
                </View>

                <Body
                    style={[styles.flex, !scroll && styles.bodyPad]}
                    contentContainerStyle={scroll ? styles.scrollContent : undefined}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    {...(scroll ? { keyboardDismissMode: 'on-drag' as const } : {})}
                >
                    {/* Boşluğa dokununca klavye kapansın */}
                    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.dismissArea}>
                        <View style={styles.titleBlock}>
                            <AppText variant="title">{title}</AppText>
                            {subtitle ? (
                                <AppText variant="body" style={styles.subtitle}>
                                    {subtitle}
                                </AppText>
                            ) : null}
                        </View>
                        {children}
                    </Pressable>
                </Body>

                <View style={styles.footer}>
                    {footerNote}
                    <Button
                        title={ctaLabel}
                        onPress={onNext || (() => {})}
                        disabled={nextDisabled}
                        loading={loading}
                    />
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        gap: Spacing.md,
    },
    backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    progressWrap: { flex: 1 },
    stepText: { width: 34, textAlign: 'right' },
    scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, flexGrow: 1 },
    dismissArea: { flex: 1 },
    bodyPad: { paddingHorizontal: Spacing.xl },
    titleBlock: { marginTop: Spacing.xl, marginBottom: Spacing.xl },
    subtitle: { marginTop: Spacing.sm },
    footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
});
