import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { AppText } from './AppText';
import { Button } from './Button';

/* ---------------- ProgressBar ---------------- */
export function ProgressBar({ progress, style }: { progress: number; style?: StyleProp<ViewStyle> }) {
    const clamped = Math.max(0, Math.min(1, progress));
    const anim = useRef(new Animated.Value(clamped)).current;
    useEffect(() => {
        Animated.timing(anim, { toValue: clamped, duration: 300, useNativeDriver: false }).start();
    }, [clamped]);
    const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    return (
        <View style={[styles.track, style]} accessibilityRole="progressbar">
            <Animated.View style={[styles.fillWrap, { width }]}>
                <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
            </Animated.View>
        </View>
    );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction,
}: {
    icon?: React.ReactNode;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <View style={styles.empty}>
            {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}
            <AppText variant="h2" center>{title}</AppText>
            {message ? <AppText variant="body" center style={styles.emptyMsg}>{message}</AppText> : null}
            {actionLabel && onAction ? (
                <Button title={actionLabel} onPress={onAction} fullWidth={false} size="md" style={styles.emptyBtn} />
            ) : null}
        </View>
    );
}

/* ---------------- LoadingView ---------------- */
export function LoadingView({ text }: { text?: string }) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.accentYellow} />
            {text ? <AppText variant="callout" center style={styles.loadingText}>{text}</AppText> : null}
        </View>
    );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ height = 16, width = '100%', radius = BorderRadius.sm, style }: { height?: number; width?: any; radius?: number; style?: StyleProp<ViewStyle> }) {
    const anim = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);
    return <Animated.View style={[{ height, width, borderRadius: radius, backgroundColor: Colors.surface2, opacity: anim }, style]} />;
}

const styles = StyleSheet.create({
    track: { height: 6, borderRadius: 999, backgroundColor: Colors.surface2, overflow: 'hidden' },
    fillWrap: { height: '100%' },
    fill: { flex: 1, borderRadius: 999 },
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.huge, paddingHorizontal: Spacing.xl },
    emptyIcon: { marginBottom: Spacing.lg, opacity: 0.9 },
    emptyMsg: { marginTop: Spacing.sm },
    emptyBtn: { marginTop: Spacing.xl },
    loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.huge },
    loadingText: { marginTop: Spacing.md },
});
