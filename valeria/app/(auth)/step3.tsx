import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground, PrimaryButton } from '../../src/components';
import { useUserStore } from '../../src/stores/useUserStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

export default function Step3() {
    const [day, setDay] = useState(15);
    const [month, setMonth] = useState(6);
    const [year, setYear] = useState(1995);
    const setProfile = useUserStore((s) => s.setProfile);

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];

    const handleNext = () => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setProfile({ birthDate: dateStr });
        router.push('/(auth)/step4');
    };

    return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.step}>3 / 8</Text>
                    <Text style={styles.title}>Doğum Tarihiniz</Text>
                    <Text style={styles.subtitle}>
                        Kozmik haritanızı çıkarmak için doğum tarihinize ihtiyacımız var.
                    </Text>

                    {/* Day Selector */}
                    <Text style={styles.label}>Gün</Text>
                    <View style={styles.pickerRow}>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setDay(Math.max(1, day - 1))}
                        >
                            <Text style={styles.arrow}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.pickerValue}>{day}</Text>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setDay(Math.min(31, day + 1))}
                        >
                            <Text style={styles.arrow}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Month Selector */}
                    <Text style={styles.label}>Ay</Text>
                    <View style={styles.pickerRow}>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setMonth(Math.max(1, month - 1))}
                        >
                            <Text style={styles.arrow}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.pickerValue}>{months[month - 1]}</Text>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setMonth(Math.min(12, month + 1))}
                        >
                            <Text style={styles.arrow}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Year Selector */}
                    <Text style={styles.label}>Yıl</Text>
                    <View style={styles.pickerRow}>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setYear(Math.max(1940, year - 1))}
                        >
                            <Text style={styles.arrow}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.pickerValue}>{year}</Text>
                        <TouchableOpacity
                            style={styles.arrowBtn}
                            onPress={() => setYear(Math.min(2010, year + 1))}
                        >
                            <Text style={styles.arrow}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Text style={styles.backText}>← Geri</Text>
                        </TouchableOpacity>
                        <PrimaryButton title="Devam Et" onPress={handleNext} style={{ flex: 1 }} />
                    </View>
                </View>
            </View>
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
        paddingTop: 100,
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
    label: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
        marginTop: Spacing.lg,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    arrowBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.backgroundCardLight,
    },
    arrow: {
        fontSize: FontSize.xl,
        color: Colors.purpleLight,
        fontWeight: '600',
    },
    pickerValue: {
        flex: 1,
        textAlign: 'center',
        fontSize: FontSize.xl,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    footer: {
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
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    backText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
});
