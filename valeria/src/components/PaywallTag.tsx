import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, FontSize, Spacing } from '../theme/spacing';

interface PaywallTagProps {
    isPaid: boolean;
    style?: ViewStyle;
}

export function PaywallTag({ isPaid, style }: PaywallTagProps) {
    return (
        <Text
            style={[
                styles.tag,
                {
                    backgroundColor: isPaid ? Colors.tagPro + '20' : Colors.tagFree + '20',
                    color: isPaid ? Colors.tagPro : Colors.tagFree,
                },
                style,
            ]}
        >
            {isPaid ? 'PRO' : 'FREE'}
        </Text>
    );
}

const styles = StyleSheet.create({
    tag: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
});
