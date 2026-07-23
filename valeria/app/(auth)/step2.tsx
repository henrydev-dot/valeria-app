import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

const GENDER_OPTIONS = [
    { id: 'kadin', label: 'Kadın', icon: 'female-outline' as const },
    { id: 'erkek', label: 'Erkek', icon: 'male-outline' as const },
    { id: 'non-binary', label: 'Non-Binary', icon: 'infinite-outline' as const },
    { id: 'trans-kadin', label: 'Trans Kadın', icon: 'transgender-outline' as const },
    { id: 'trans-erkek', label: 'Trans Erkek', icon: 'transgender-outline' as const },
    { id: 'gender-fluid', label: 'Gender Fluid', icon: 'water-outline' as const },
    { id: 'diger', label: 'Diğer', icon: 'ellipse-outline' as const },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' as const },
];

export default function Step2() {
    const [selected, setSelected] = useState('');
    const setProfile = useUserStore((s) => s.setProfile);

    const handleNext = () => {
        if (!selected) return;
        setProfile({ gender: selected });
        router.push('/(auth)/step3');
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.step}>2 / 8</Text>
                <Text style={styles.title}>Cinsiyetiniz</Text>
                <Text style={styles.subtitle}>
                    Kendinize en yakın hissettiğiniz seçeneği belirleyin.
                </Text>
                <View style={styles.grid}>
                    {GENDER_OPTIONS.map((option) => {
                        const isSelected = selected === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.card, isSelected && styles.cardSelected]}
                                onPress={() => setSelected(option.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={28}
                                    color={isSelected ? Colors.accentYellow : Colors.textMuted}
                                />
                                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                                    {option.label}
                                </Text>
                                {isSelected && (
                                    <View style={styles.check}>
                                        <Ionicons name="checkmark-circle" size={18} color={Colors.accentYellow} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
                        <Text style={styles.backText}>Geri</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                        title="Devam Et"
                        onPress={handleNext}
                        disabled={!selected}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xxl,
    },
    scrollContent: {
        paddingTop: 100,
        paddingBottom: 120,
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
        marginBottom: Spacing.xxl,
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    card: {
        width: '47%',
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.backgroundCard,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
    },
    cardSelected: {
        backgroundColor: Colors.purple + '20',
        borderColor: Colors.accentYellow + '60',
    },
    cardText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
    cardTextSelected: {
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    check: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    footer: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.huge,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    backText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
});
