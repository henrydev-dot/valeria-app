import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
    children: React.ReactNode;
    /** Number of static stars in the field. */
    stars?: number;
}

// Deterministic pseudo-random so the starfield is stable across renders.
function makeStars(count: number) {
    const out: { left: number; top: number; opacity: number; size: number }[] = [];
    let seed = 1337;
    const rnd = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    for (let i = 0; i < count; i++) {
        out.push({
            left: rnd() * width,
            top: rnd() * height,
            opacity: rnd() * 0.4 + 0.1,
            size: rnd() * 2 + 1,
        });
    }
    return out;
}

export function GradientBackground({ children, stars = 40 }: GradientBackgroundProps) {
    // Computed once; never re-randomizes on re-render (fixes starfield flicker).
    const dots = useMemo(() => makeStars(stars), [stars]);

    return (
        <LinearGradient
            colors={Gradients.background}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <View style={styles.dotOverlay} pointerEvents="none">
                {dots.map((d, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            { left: d.left, top: d.top, opacity: d.opacity, width: d.size, height: d.size },
                        ]}
                    />
                ))}
            </View>
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    dotOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    dot: { position: 'absolute', borderRadius: 999, backgroundColor: Colors.textPrimary },
});
