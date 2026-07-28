import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
    Screen,
    Header,
    AppText,
    Button,
    Card,
    LoadingView,
} from '../src/components';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';
import * as api from '../src/api';
import { Features } from '../src/config';

const COFFEE_COST = 25;
const ADVISOR_COFFEE_COST = 100; // insan falcıya kahve falı
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6MB guard
const IMAGE_LABELS = ['Fincan İçi (Üst)', 'Fincan İçi (Yan)', 'Tabak', 'Fincan Dibi'];

export default function CoffeeReadingScreen() {
    const { advisorId } = useLocalSearchParams<{ advisorId?: string }>();
    const [question, setQuestion] = useState('');
    const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
    // ASENKRON AKIŞ: fal gönderilir, kullanıcı beklemez; sonuç Fal sekmesindeki
    // "Fal İstekleriniz"e düşer ve push bildirimi gelir.
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const credits = useEntitlementsStore((s) => s.credits);
    const refreshEnt = useEntitlementsStore((s) => s.refresh);

    const pickImage = async (index: number) => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert(
                'İzin Gerekli',
                'Fotoğraf seçebilmek için galeri erişim izni vermeniz gerekiyor.'
            );
            return;
        }
        const imgResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.6,
            base64: true,
        });
        if (imgResult.canceled || !imgResult.assets[0]?.base64) return;

        const asset = imgResult.assets[0];
        const approxBytes = Math.ceil((asset.base64!.length * 3) / 4);
        if (approxBytes > MAX_IMAGE_BYTES) {
            Alert.alert(
                'Fotoğraf Çok Büyük',
                'Lütfen daha küçük bir fotoğraf seçin (en fazla ~6 MB).'
            );
            return;
        }
        setImages((prev) => {
            const next = [...prev];
            next[index] = `data:image/jpeg;base64,${asset.base64}`;
            return next;
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    };

    const filledCount = images.filter((img) => img !== null).length;
    const allImagesSelected = filledCount === 4;
    const isAdvisor = !!advisorId;

    const handleSubmit = async () => {
        if (!allImagesSelected) {
            Alert.alert(
                'Fotoğraf Gerekli',
                'Lütfen kahve fincanınızın 4 fotoğrafını da yükleyin. Fincan fotoğrafı olmadan fal bakılamaz.'
            );
            return;
        }
        if (!question.trim()) {
            Alert.alert('Soru Gerekli', 'Lütfen merak ettiğiniz bir soru yazın.');
            return;
        }
        if (isAdvisor && credits < ADVISOR_COFFEE_COST) {
            Alert.alert(
                'Yetersiz Kredi',
                `Gerçek falcıya fal göndermek ${ADVISOR_COFFEE_COST} kredi (mevcut: ${credits}). Dilersen Valeria'ya ${COFFEE_COST} krediye baktırabilirsin.`
            );
            return;
        }
        if (!isAdvisor && credits < COFFEE_COST) {
            if (Features.purchasesEnabled) {
                Alert.alert(
                    'Yetersiz Kredi',
                    `Bu fal için ${COFFEE_COST} kredi gerekiyor. Mevcut bakiyeniz: ${credits} kredi.`,
                    [
                        { text: 'Vazgeç', style: 'cancel' },
                        { text: 'Kredi Al', onPress: () => router.push('/buy-credits') },
                    ]
                );
            } else {
                // No purchases — guide the user to earn credits for free instead.
                Alert.alert(
                    'Yetersiz Kredi',
                    `Bu fal için ${COFFEE_COST} kredi gerekiyor (mevcut: ${credits}). Krediler ücretsiz kazanılıyor: profildeki günlük ödülünü al, serini sürdür ve seviye atlayarak kredi topla.`
                );
            }
            return;
        }

        setLoading(true);
        try {
            // Valeria da insan yorumcu da aynı asenkron kuyruğu kullanır:
            // istek anında gider, cevap hazır olunca bildirim + Fal sekmesi.
            await api.readings.advisorRequest(
                isAdvisor ? (advisorId as string) : 'valeria',
                'kahve',
                question.trim(),
                images as string[]
            );
            await refreshEnt();
            setSent(true);
        } catch (e: any) {
            Alert.alert('Hata', e.message || 'Kahve falı gönderilemedi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen keyboard>
            <Header title={isAdvisor ? 'Kahve Falı (Yorumcu)' : 'Kahve Falı'} />

            {!sent ? (
                <View style={styles.section}>
                    <Card glow style={styles.introCard}>
                        <View style={styles.introIcon}>
                            <Ionicons name="cafe" size={40} color={Colors.accentYellow} />
                        </View>
                        <AppText variant="h1" center>
                            Fincanınızı Okutun
                        </AppText>
                        <AppText variant="body" center>
                            Kahve fincanınızın 4 farklı açıdan fotoğrafını yükleyin.
                            {isAdvisor
                                ? ' Falınız gerçek bir yorumcuya iletilecek.'
                                : ' Yapay zeka fincanınızı yorumlayacak.'}
                        </AppText>
                        <View style={styles.costPill}>
                            <Ionicons name="diamond" size={14} color={Colors.accentYellow} />
                            <AppText variant="bodyStrong" color={Colors.accentYellow}>
                                {isAdvisor ? ADVISOR_COFFEE_COST : COFFEE_COST} kredi
                            </AppText>
                        </View>
                    </Card>

                    <AppText variant="label" style={styles.label}>
                        Sorunuz (zorunlu)
                    </AppText>
                    <TextInput
                        style={styles.input}
                        placeholder="Merak ettiklerinizi yazın..."
                        placeholderTextColor={Colors.textMuted}
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                        editable={!loading}
                    />

                    <View style={styles.uploadHeader}>
                        <AppText variant="label" style={styles.label}>
                            Fincan Fotoğrafları
                        </AppText>
                        <AppText
                            variant="caption"
                            color={allImagesSelected ? Colors.success : Colors.textMuted}
                        >
                            {filledCount}/4 yüklendi
                        </AppText>
                    </View>

                    <View style={styles.imagesGrid}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageSlot}>
                                <TouchableOpacity
                                    style={styles.imageTouch}
                                    activeOpacity={0.8}
                                    onPress={() => pickImage(index)}
                                    disabled={loading}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${IMAGE_LABELS[index]} fotoğrafı ${uri ? 'değiştir' : 'ekle'}`}
                                >
                                    {uri ? (
                                        <Image source={{ uri }} style={styles.imageThumb} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Ionicons
                                                name="camera-outline"
                                                size={26}
                                                color={Colors.textMuted}
                                            />
                                            <AppText variant="caption" center>
                                                {IMAGE_LABELS[index]}
                                            </AppText>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                {uri ? (
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => removeImage(index)}
                                        disabled={loading}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${IMAGE_LABELS[index]} fotoğrafını kaldır`}
                                    >
                                        <Ionicons name="close-circle" size={22} color={Colors.error} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        ))}
                    </View>

                    <View style={styles.hintRow}>
                        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                        <AppText variant="caption" style={styles.hintText}>
                            Sadece kahve fincanı fotoğrafı kabul edilir. Net ve aydınlık
                            fotoğraflar daha isabetli yorum sağlar.
                        </AppText>
                    </View>

                    {loading ? (
                        <LoadingView text="Falınız gönderiliyor..." />
                    ) : (
                        <Button
                            title={isAdvisor ? 'Yorumcuya Gönder' : 'Fal Baktır'}
                            onPress={handleSubmit}
                            style={styles.cta}
                            icon={<Ionicons name="cafe" size={18} color={Colors.textOnAccent} />}
                        />
                    )}
                </View>
            ) : (
                <View style={styles.section}>
                    <Card glow style={styles.resultHeader}>
                        <Ionicons name="checkmark-circle" size={44} color={Colors.success} />
                        <AppText variant="h1" center>Falınız Ulaştı</AppText>
                        <AppText variant="body" center>
                            {isAdvisor
                                ? 'Fincan fotoğrafların ve sorun yorumcuya iletildi. Yorumu hazır olduğunda bildirim alacaksın; cevabı Fal sekmesindeki "Fal İstekleriniz" bölümünde görebilirsin.'
                                : 'Valeria fincanını okumaya başladı. Yorumun birkaç saniye içinde Fal sekmesindeki "Fal İstekleriniz" bölümüne düşecek ve bildirim alacaksın. Beklemene gerek yok.'}
                        </AppText>
                    </Card>

                    <View style={styles.actions}>
                        <Button
                            title="Fal İsteklerime Git"
                            onPress={() => router.replace('/(tabs)/reading' as any)}
                            icon={<Ionicons name="eye" size={16} color={Colors.textOnAccent} />}
                        />
                        <Button
                            title="Kapat"
                            variant="secondary"
                            onPress={() => router.back()}
                        />
                    </View>
                </View>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    section: { gap: Spacing.lg },
    introCard: { alignItems: 'center', gap: Spacing.md },
    introIcon: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.goldA12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    costPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.goldA12,
        borderRadius: BorderRadius.pill,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    label: { marginBottom: Spacing.xs, marginLeft: Spacing.xs },
    input: {
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 16,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 88,
        textAlignVertical: 'top',
    },
    uploadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    imageSlot: {
        width: '47%',
        aspectRatio: 1,
    },
    imageTouch: {
        flex: 1,
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
        backgroundColor: Colors.surface1,
        gap: Spacing.xs,
        padding: Spacing.sm,
    },
    imageThumb: { width: '100%', height: '100%' },
    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: Colors.backgroundDark,
        borderRadius: BorderRadius.full,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.xs,
    },
    hintText: { flex: 1 },
    cta: { marginTop: Spacing.sm },
    resultHeader: { alignItems: 'center', gap: Spacing.sm },
    sectionCard: { gap: Spacing.sm },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    actions: { gap: Spacing.md, marginTop: Spacing.md },
});
