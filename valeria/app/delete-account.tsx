import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header, AppText, Button, Card, Field } from '../src/components';
import { useUserStore } from '../src/stores/useUserStore';
import { Colors } from '../src/theme/colors';
import { Spacing } from '../src/theme/spacing';

const CONFIRM_WORD = 'SİL';

const CONSEQUENCES = [
    'Profilin, doğum bilgilerin ve kozmik haritan',
    'Tüm fal, tarot ve kahve okuma geçmişin',
    'Kredilerin, XP ve üyelik durumun',
    'Danışman istekleri ve mesajların',
];

export default function DeleteAccountScreen() {
    const deleteAccount = useUserStore((s) => s.deleteAccount);
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const doDelete = async () => {
        setLoading(true);
        try {
            await deleteAccount();
            router.replace('/(auth)/welcome');
        } catch (e: any) {
            Alert.alert('Silme başarısız', e?.message || 'Bir sorun oluştu. Lütfen tekrar dene.');
            setLoading(false);
        }
    };

    const onPress = () => {
        Alert.alert(
            'Hesabını sil',
            'Bu işlem geri alınamaz. Hesabın ve tüm verilerin kalıcı olarak silinecek.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Kalıcı Olarak Sil', style: 'destructive', onPress: doDelete },
            ]
        );
    };

    return (
        <Screen>
            <Header title="Hesabı Sil" />
            <View style={styles.iconWrap}>
                <Ionicons name="warning-outline" size={40} color={Colors.error} />
            </View>
            <AppText variant="title" center style={styles.title}>Hesabını silmek üzeresin</AppText>
            <AppText variant="body" center color={Colors.textSecondary} style={styles.subtitle}>
                Bu işlem geri alınamaz. Aşağıdaki tüm verilerin kalıcı olarak silinecek:
            </AppText>

            <Card style={styles.card}>
                {CONSEQUENCES.map((c) => (
                    <View key={c} style={styles.row}>
                        <Ionicons name="close-circle" size={18} color={Colors.error} />
                        <AppText variant="body" color={Colors.textSecondary} style={styles.rowText}>{c}</AppText>
                    </View>
                ))}
            </Card>

            <AppText variant="callout" color={Colors.textSecondary} style={styles.prompt}>
                Onaylamak için aşağıya <AppText variant="bodyStrong" color={Colors.textPrimary}>{CONFIRM_WORD}</AppText> yaz.
            </AppText>
            <Field
                placeholder={CONFIRM_WORD}
                value={confirm}
                onChangeText={setConfirm}
                autoCapitalize="characters"
                autoCorrect={false}
            />

            <Button
                title="Hesabımı Kalıcı Olarak Sil"
                variant="danger"
                onPress={onPress}
                loading={loading}
                disabled={confirm.trim().toLocaleUpperCase('tr') !== CONFIRM_WORD}
            />
            <Button title="Vazgeç" variant="ghost" onPress={() => router.back()} style={styles.cancel} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    iconWrap: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md },
    title: { marginBottom: Spacing.sm },
    subtitle: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.sm },
    card: { marginBottom: Spacing.xl, gap: Spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    rowText: { flex: 1 },
    prompt: { marginBottom: Spacing.sm },
    cancel: { marginTop: Spacing.md },
});
