import React, { useMemo, useState } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';

/* Türkçe-duyarlı arama normalizasyonu */
const norm = (s: string) =>
    (s || '')
        .toLocaleLowerCase('tr-TR')
        .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');

interface SelectModalProps {
    visible: boolean;
    title: string;
    options: string[];
    selected?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    searchPlaceholder?: string;
}

/**
 * Tam ekran arama + liste seçim sayfası. Satıra dokununca seçer ve kapanır;
 * klavye açık kalma sorunu yaşanmaz (modal kapanınca klavye de kapanır).
 */
export function SelectModal({
    visible,
    title,
    options,
    selected,
    onSelect,
    onClose,
    searchPlaceholder = 'Ara...',
}: SelectModalProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = norm(query.trim());
        if (!q) return options;
        // Önce baştan eşleşenler, sonra içerenler
        const starts = options.filter((o) => norm(o).startsWith(q));
        const includes = options.filter((o) => !norm(o).startsWith(q) && norm(o).includes(q));
        return [...starts, ...includes];
    }, [options, query]);

    const handleSelect = (value: string) => {
        Keyboard.dismiss();
        setQuery('');
        onSelect(value);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setQuery('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose} transparent>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView
                    style={styles.sheetWrap}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <AppText variant="h2">{title}</AppText>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeBtn}
                                accessibilityRole="button"
                                accessibilityLabel="Kapat"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchRow}>
                            <Ionicons name="search" size={17} color={Colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={searchPlaceholder}
                                placeholderTextColor={Colors.textMuted}
                                value={query}
                                onChangeText={setQuery}
                                autoCorrect={false}
                                returnKeyType="search"
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Aramayı temizle">
                                    <Ionicons name="close-circle" size={17} color={Colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            initialNumToRender={20}
                            renderItem={({ item }) => {
                                const isActive = item === selected;
                                return (
                                    <TouchableOpacity
                                        style={[styles.row, isActive && styles.rowActive]}
                                        onPress={() => handleSelect(item)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isActive }}
                                    >
                                        <AppText
                                            variant={isActive ? 'bodyStrong' : 'body'}
                                            color={isActive ? Colors.accentYellow : Colors.textPrimary}
                                        >
                                            {item}
                                        </AppText>
                                        {isActive && <Ionicons name="checkmark" size={18} color={Colors.accentYellow} />}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <AppText variant="body" color={Colors.textMuted} center>
                                        Sonuç bulunamadı
                                    </AppText>
                                </View>
                            }
                        />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

/** Dokununca SelectModal açan, seçili değeri gösteren alan. */
export function SelectField({
    label,
    value,
    placeholder,
    icon,
    onPress,
    disabled,
}: {
    label: string;
    value?: string;
    placeholder: string;
    icon?: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <View style={styles.fieldWrap}>
            <AppText variant="label" style={styles.fieldLabel}>{label}</AppText>
            <TouchableOpacity
                style={[styles.field, disabled && styles.fieldDisabled]}
                onPress={() => { Keyboard.dismiss(); onPress(); }}
                activeOpacity={0.8}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${value || placeholder}`}
            >
                {icon}
                <AppText
                    variant="body"
                    color={value ? Colors.textPrimary : Colors.textMuted}
                    style={styles.fieldValue}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </AppText>
                <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
    sheetWrap: { maxHeight: '85%' },
    sheet: {
        backgroundColor: Colors.backgroundModal,
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
        height: '100%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: Colors.whiteA08,
        alignItems: 'center', justifyContent: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 16, paddingVertical: Spacing.md },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    rowActive: {},
    empty: { paddingVertical: Spacing.xxxl },
    // SelectField
    fieldWrap: { marginBottom: Spacing.lg },
    fieldLabel: { marginBottom: Spacing.xs, marginLeft: Spacing.xs },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
    },
    fieldDisabled: { opacity: 0.45 },
    fieldValue: { flex: 1 },
});
