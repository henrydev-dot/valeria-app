import React, { useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius } from '../theme/spacing';
import { AppText } from './AppText';

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // odd number; center row is the selection
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE;
const PAD = ITEM_HEIGHT * Math.floor(VISIBLE / 2);

interface WheelPickerProps {
    options: string[];
    /** Selected index. */
    value: number;
    onChange: (index: number) => void;
    /** Optional min width. */
    width?: number;
}

/**
 * Lightweight iOS-style scrolling wheel picker. Pure JS (works in Expo Go):
 * a snapping ScrollView with a highlighted center row. Far more mobile-friendly
 * than +/- steppers for long ranges (years, minutes).
 */
export function WheelPicker({ options, value, onChange, width }: WheelPickerProps) {
    const ref = useRef<ScrollView>(null);
    const settling = useRef(false);

    // Keep scroll position in sync when value changes externally.
    useEffect(() => {
        const y = value * ITEM_HEIGHT;
        // Defer so layout is ready on first mount.
        const t = setTimeout(() => ref.current?.scrollTo({ y, animated: false }), 0);
        return () => clearTimeout(t);
    }, [value]);

    const commit = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        settling.current = false;
        const y = e.nativeEvent.contentOffset.y;
        const idx = Math.max(0, Math.min(options.length - 1, Math.round(y / ITEM_HEIGHT)));
        if (idx !== value) onChange(idx);
        // Snap exactly onto the row.
        ref.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
    };

    return (
        <View style={[styles.wrap, width ? { width } : null]}>
            {/* Center selection highlight */}
            <View pointerEvents="none" style={styles.highlight} />
            <ScrollView
                ref={ref}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScrollBeginDrag={() => { settling.current = true; }}
                onMomentumScrollEnd={commit}
                onScrollEndDrag={(e) => { if (!settling.current) return; commit(e); }}
                contentContainerStyle={{ paddingVertical: PAD }}
            >
                {options.map((opt, i) => {
                    const active = i === value;
                    return (
                        <TouchableOpacity
                            key={`${opt}-${i}`}
                            activeOpacity={0.7}
                            style={styles.item}
                            onPress={() => {
                                onChange(i);
                                ref.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                            }}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                        >
                            <AppText
                                variant={active ? 'h2' : 'body'}
                                color={active ? Colors.textPrimary : Colors.textMuted}
                            >
                                {opt}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        height: PICKER_HEIGHT,
        flex: 1,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    highlight: {
        position: 'absolute',
        top: PAD,
        left: 6,
        right: 6,
        height: ITEM_HEIGHT,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.whiteA05,
        borderWidth: 1,
        borderColor: Colors.borderAccent,
    },
    item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
