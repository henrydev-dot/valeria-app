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
        if (__DEV__) console.warn('AppText received a non-renderable object child; ignoring.');
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
