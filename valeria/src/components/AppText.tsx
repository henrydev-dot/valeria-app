import React from 'react';
import { Text, TextProps, TextStyle, StyleProp } from 'react-native';
import { Typography, TypographyVariant } from '../theme/typography';

interface AppTextProps extends TextProps {
    variant?: TypographyVariant;
    color?: string;
    center?: boolean;
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

/**
 * Single typography primitive. Use variants instead of raw fontSize/fontWeight.
 */
export function AppText({
    variant = 'body',
    color,
    center,
    style,
    children,
    ...rest
}: AppTextProps) {
    return (
        <Text
            style={[
                Typography[variant],
                color ? { color } : null,
                center ? { textAlign: 'center' } : null,
                style,
            ]}
            {...rest}
        >
            {children}
        </Text>
    );
}
