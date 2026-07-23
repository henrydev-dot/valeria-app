import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

// Simple deity assignment based on zodiac sign (no quiz needed)
const SIGN_DEITY: Record<string, { id: string; name: string }> = {
    Koc: { id: 'ares', name: 'Ares' },
    Boga: { id: 'aphrodite', name: 'Afrodit' },
    Ikizler: { id: 'hermes', name: 'Hermes' },
    Yengec: { id: 'artemis', name: 'Artemis' },
    Aslan: { id: 'apollo', name: 'Apollo' },
    Basak: { id: 'athena', name: 'Athena' },
    Terazi: { id: 'aphrodite', name: 'Afrodit' },
    Akrep: { id: 'hades', name: 'Hades' },
    Yay: { id: 'zeus', name: 'Zeus' },
    Oglak: { id: 'athena', name: 'Athena' },
    Kova: { id: 'poseidon', name: 'Poseidon' },
    Balik: { id: 'poseidon', name: 'Poseidon' },
};

function getSunSign(dateStr: string): string {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Koc';
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Boga';
    if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Ikizler';
    if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Yengec';
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Aslan';
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Basak';
    if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Terazi';
    if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Akrep';
    if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Yay';
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Oglak';
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Kova';
    return 'Balik';
}

const RELATIONSHIP_OPTIONS = [
    { id: 'bekar', label: 'Bekar', icon: 'person-outline' as const },
    { id: 'iliskide', label: 'İlişkide', icon: 'heart-outline' as const },
    { id: 'nisanli', label: 'Nişanlı', icon: 'diamond-outline' as const },
    { id: 'evli', label: 'Evli', icon: 'heart-circle-outline' as const },
    { id: 'ayrilik-surecinde', label: 'Ayrılık Sürecinde', icon: 'heart-dislike-outline' as const },
    { id: 'terk-edilmis', label: 'Terk Edilmiş', icon: 'sad-outline' as const },
    { id: 'karmasik', label: 'Karmaşık', icon: 'help-circle-outline' as const },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' as const },
];

const WORK_OPTIONS = [
    { id: 'ogrenci', label: 'Öğrenci', icon: 'school-outline' as const },
    { id: 'calisan', label: 'Çalışan', icon: 'briefcase-outline' as const },
    { id: 'serbest', label: 'Serbest Meslek', icon: 'rocket-outline' as const },
    { id: 'girisimci', label: 'Girişimci', icon: 'bulb-outline' as const },
    { id: 'is-ariyor', label: 'İş Arıyor', icon: 'search-outline' as const },
    { id: 'emekli', label: 'Emekli', icon: 'sunny-outline' as const },
    { id: 'ev-hanimi', label: 'Ev Hanımı', icon: 'home-outline' as const },
    { id: 'calismiyor', label: 'Çalışmıyor', icon: 'pause-circle-outline' as const },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' as const },
];

export default function Step6() {
    const [relationship, setRelationship] = useState('');
    const [work, setWork] = useState('');
    const profile = useUserStore((s) => s.profile);
    const setProfile = useUserStore((s) => s.setProfile);

    const handleNext = () => {
        if (!relationship || !work) return;

        // Save relationship & work status to local profile state
        // Zodiac calculations + backend save happen in step7 & step8
        setProfile({
            relationshipStatus: relationship,
            workStatus: work,
        });
        router.push('/(auth)/step7');
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.step}>6 / 8</Text>
                <Text style={styles.title}>Hayatınız</Text>
                <Text style={styles.subtitle}>
                    Size özel yorumlar hazırlayabilmemiz için birkaç bilgi daha.
                </Text>

                {/* Relationship Status */}
                <Text style={styles.sectionLabel}>İlişki Durumunuz</Text>
                <View style={styles.grid}>
                    {RELATIONSHIP_OPTIONS.map((option) => {
                        const isSelected = relationship === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.chip, isSelected && styles.chipSelected]}
                                onPress={() => setRelationship(option.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={18}
                                    color={isSelected ? Colors.accentYellow : Colors.textMuted}
                                />
                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Work Status */}
                <Text style={[styles.sectionLabel, { marginTop: Spacing.xxl }]}>Çalışma Durumunuz</Text>
                <View style={styles.grid}>
                    {WORK_OPTIONS.map((option) => {
                        const isSelected = work === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.chip, isSelected && styles.chipSelected]}
                                onPress={() => setWork(option.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={18}
                                    color={isSelected ? Colors.accentYellow : Colors.textMuted}
                                />
                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backText}>← Geri</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                        title="Devam Et"
                        onPress={handleNext}
                        disabled={!relationship || !work}
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
        paddingTop: 80,
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
    sectionLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.purpleLight,
        marginBottom: Spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.backgroundCard,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.xs,
    },
    chipSelected: {
        backgroundColor: Colors.purple + '30',
        borderColor: Colors.accentYellow + '50',
    },
    chipText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: Colors.accentYellow,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.huge,
        paddingTop: Spacing.lg,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    backText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
});
