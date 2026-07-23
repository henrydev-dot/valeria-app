import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
    children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Subtle dot overlay */}
            <View style={styles.dotOverlay}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                left: Math.random() * width,
                                top: Math.random() * height,
                                opacity: Math.random() * 0.4 + 0.1,
                                width: Math.random() * 2 + 1,
                                height: Math.random() * 2 + 1,
                            },
                        ]}
                    />
                ))}
            </View>
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dotOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    dot: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
    },
});
