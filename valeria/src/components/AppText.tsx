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
// Guard against accidentally passing a plain object as a child, which would
// otherwise throw "Objects are not valid as a React child" and crash the screen.
function safeChildren(children: React.ReactNode): React.ReactNode {
    if (
        children != null &&
        typeof children === 'object' &&
        !Array.isArray(children) &&
        !(children as any).$$typeof
    ) {
        const values = Object.values(children as object)
            .filter((val): val is string => typeof val === 'string' && val.trim().length > 0);
        if (values.length) return values.join('\n\n');
        return null;
    }
    return children;
}

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
            {safeChildren(children)}
        </Text>
    );
}
