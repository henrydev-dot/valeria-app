import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground, KismetCard, PrimaryButton } from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';
import * as api from '../src/api';

const IMAGE_LABELS = ['Fincan İçi (Üst)', 'Fincan İçi (Yan)', 'Tabak', 'Fincan Dibi'];

export default function CoffeeReadingScreen() {
    const { advisorId } = useLocalSearchParams();
    const [question, setQuestion] = useState('');
    const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const pickImage = async (index: number) => {
        const imgResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.6,
            base64: true,
        });
        if (!imgResult.canceled && imgResult.assets[0]) {
            const newImages = [...images];
            newImages[index] = `data:image/jpeg;base64,${imgResult.assets[0].base64}`;
            setImages(newImages);
        }
    };

    const allImagesSelected = images.every((img) => img !== null);

    const handleSubmit = async () => {
        if (!allImagesSelected) {
            Alert.alert(
                'Fotoğraf Gerekli',
                'Lütfen kahve fincanınızın 4 fotoğrafını da yükleyin. Kahve fincanı fotoğrafı olmadan fal bakılamaz.'
            );
            return;
        }
        if (!question.trim()) {
            Alert.alert('Soru Gerekli', 'Lütfen merak ettiğiniz bir soru yazın.');
            return;
        }

        setLoading(true);
        try {
            if (advisorId) {
                // Sent to real advisor
                await api.readings.advisorRequest(advisorId as string, 'kahve', question.trim(), images as string[]);
                await refreshEnt();
                Alert.alert('Başarılı', 'Kahve falınız yorumcuya iletildi. Yanıtlandığında bildirim alacaksınız.', [
                    { text: 'Tamam', onPress: () => router.back() }
                ]);
            } else {
                // Sent to AI
                const res = await api.readings.coffee(question.trim(), images as string[]);
                if (typeof res.result === 'object' && res.result !== null) {
                    setResult(res.result);
                } else {
                    setResult({
                        soruCevabi: res.result || res.answer || 'Fincanınız okunuyor...',
                        askHayati: '',
                        kariyer: '',
                        aile: '',
                    });
                }
                await refreshEnt();
            }
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Kahve falı yapılamadı');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { key: 'soruCevabi', title: 'Sorunuzun Cevabı', icon: 'help-circle-outline' as const, color: Colors.accentYellow },
        { key: 'askHayati', title: 'Aşk Hayatı', icon: 'heart-outline' as const, color: '#FF6B9D' },
        { key: 'kariyer', title: 'Kariyer & İş Hayatı', icon: 'briefcase-outline' as const, color: '#4ECDC4' },
        { key: 'aile', title: 'Aile & Yakınlar', icon: 'people-outline' as const, color: '#A78BFA' },
    ];

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Kahve Falı</Text>
                    <View style={{ width: 28 }} />
                </View>

                {!result ? (
                    <View>
                        <KismetCard glow style={styles.card}>
                            <Ionicons name="cafe" size={48} color={Colors.purpleLight} />
                            <Text style={styles.cardTitle}>Fincanınızı Okutun</Text>
                            <Text style={styles.cardDesc}>
                                4 adet kahve fincanı fotoğrafı yükleyin. Fotoğraflar kahve fincanı olmalıdır.
                            </Text>
                            <Text style={styles.costNote}>Ücret: 10 kredi</Text>
                        </KismetCard>

                        <Text style={styles.label}>Sorunuz (zorunlu)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Merak ettiklerinizi yazın..."
                            placeholderTextColor={Colors.textMuted}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            numberOfLines={3}
                            editable={!loading}
                        />

                        <Text style={styles.label}>Fincan Fotoğrafları (4 adet zorunlu)</Text>
                        <View style={styles.imagesGrid}>
                            {images.map((uri, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.imageSlot}
                                    onPress={() => pickImage(index)}
                                    disabled={loading}
                                >
                                    {uri ? (
                                        <Image source={{ uri }} style={styles.imageThumb} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Ionicons name="camera-outline" size={24} color={Colors.textMuted} />
                                            <Text style={styles.imageLabel}>{IMAGE_LABELS[index]}</Text>
                                        </View>
                                    )}
                                    {uri && (
                                        <View style={styles.imageCheck}>
                                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.imageHint}>
                            ☕ Sadece kahve fincanı fotoğrafı kabul edilir. Fincan fotoğrafı olmadan fal bakılmaz.
                        </Text>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.accentYellow} />
                                <Text style={styles.loadingText}>Falınız okunuyor...</Text>
                            </View>
                        ) : (
                            <PrimaryButton
                                title="Fal Baktır"
                                onPress={handleSubmit}
                                style={styles.submitBtn}
                            />
                        )}
                    </View>
                ) : (
                    <View>
                        <KismetCard glow style={styles.resultHeader}>
                            <Ionicons name="cafe" size={32} color={Colors.accentYellow} />
                            <Text style={styles.resultTitle}>Fal Sonucunuz</Text>
                            <Text style={styles.resultQuestion}>"{question}"</Text>
                        </KismetCard>

                        {sections.map((section) => {
                            const text = result[section.key];
                            if (!text) return null;
                            return (
                                <KismetCard key={section.key} style={styles.sectionCard}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name={section.icon} size={20} color={section.color} />
                                        <Text style={[styles.sectionTitle, { color: section.color }]}>
                                            {section.title}
                                        </Text>
                                    </View>
                                    <Text style={styles.sectionText}>{text}</Text>
                                </KismetCard>
                            );
                        })}

                        <View style={styles.actionRow}>
                            <PrimaryButton title="Yeni Fal" onPress={() => {
                                setResult(null);
                                setQuestion('');
                                setImages([null, null, null, null]);
                            }} />
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <Text style={styles.backBtnText}>Geri Dön</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        paddingTop: 40,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    card: {
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    cardDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    costNote: {
        fontSize: FontSize.sm,
        color: Colors.accentYellow,
        fontWeight: '600',
    },
    label: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
        marginTop: Spacing.lg,
        fontWeight: '600',
    },
    input: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    imageSlot: {
        width: '47%' as any,
        aspectRatio: 1,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundCard,
        gap: 4,
    },
    imageLabel: {
        fontSize: 10,
        color: Colors.textMuted,
        textAlign: 'center',
        fontWeight: '500',
    },
    imageThumb: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.lg,
    },
    imageCheck: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
    imageHint: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: Spacing.md,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    submitBtn: {
        marginTop: Spacing.xxl,
    },
    loadingContainer: {
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.xxl,
    },
    loadingText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
    resultHeader: {
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    resultTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.accentYellow,
    },
    resultQuestion: {
        fontSize: FontSize.md,
        color: Colors.purpleLight,
        fontStyle: 'italic',
    },
    sectionCard: {
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    sectionText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    actionRow: {
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    backBtn: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    backBtnText: {
        fontSize: FontSize.md,
        color: Colors.textMuted,
        fontWeight: '600',
    },
});
