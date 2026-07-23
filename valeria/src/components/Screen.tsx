import React from 'react';
import {
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    View,
    ViewStyle,
    StyleProp,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { GradientBackground } from './GradientBackground';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface ScreenProps {
    children: React.ReactNode;
    /** Wrap content in a ScrollView (default true). */
    scroll?: boolean;
    /** Add KeyboardAvoidingView for forms (default false). */
    keyboard?: boolean;
    /** Which safe-area edges to inset. Default top+bottom. */
    edges?: Edge[];
    /** Horizontal padding applied to content. Default Spacing.xl. */
    padded?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    refreshing?: boolean;
    onRefresh?: () => void;
    /** Show star field background (default true). */
    stars?: boolean;
}

/**
 * The single screen wrapper: gradient background + safe-area insets +
 * optional scroll + keyboard handling. Replaces every ad-hoc paddingTop hack.
 */
export function Screen({
    children,
    scroll = true,
    keyboard = false,
    edges = ['top', 'bottom'],
    padded = true,
    contentContainerStyle,
    style,
    refreshing,
    onRefresh,
    stars = true,
}: ScreenProps) {
    const padStyle = padded ? styles.padded : null;

    const body = scroll ? (
        <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, padStyle, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={!!refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.accentYellow}
                    />
                ) : undefined
            }
        >
            {children}
        </ScrollView>
    ) : (
        <View style={[styles.flex, padStyle, contentContainerStyle]}>{children}</View>
    );

    return (
        <GradientBackground stars={stars ? 40 : 0}>
            <SafeAreaView style={[styles.flex, style]} edges={edges}>
                {keyboard ? (
                    <KeyboardAvoidingView
                        style={styles.flex}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        {body}
                    </KeyboardAvoidingView>
                ) : (
                    body
                )}
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { paddingTop: Spacing.md, paddingBottom: Spacing.huge },
    padded: { paddingHorizontal: Spacing.xl },
});
