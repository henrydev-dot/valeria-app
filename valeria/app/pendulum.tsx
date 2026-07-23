import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, Screen, Header, AppText, Button, Card } from '../src/components';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const STEPS = [
    'Telefonunuzu düz bir yüzeye yatırın.',
    'Kolyenizi veya sarkacınızı ekranın ortasındaki noktadan sarkıtın.',
    'Enerjinizi odaklayıp sorunuzu zihninizde sorun.',
    'Sarkacın yöneldiği harf, sayı veya cevabı izleyin.',
];

export default function PendulumScreen() {
    const [phase, setPhase] = useState<'intro' | 'board'>('intro');
    const insets = useSafeAreaInsets();

    if (phase === 'intro') {
        return (
            <Screen>
                <Header title="Sarkaç Tahtası" />
                <View style={styles.introBody}>
                    <View style={styles.introIcon}>
                        <Ionicons name="navigate" size={56} color={Colors.accentYellow} />
                    </View>
                    <AppText variant="title" center>
                        Sarkaç Tahtası
                    </AppText>
                    <AppText variant="body" center style={styles.introSub}>
                        Sarkacınızla evrenden yanıt alın. Tahtayı açmadan önce sakinleşin ve
                        sorunuza odaklanın.
                    </AppText>

                    <Card style={styles.stepsCard}>
                        {STEPS.map((txt, i) => (
                            <View key={i} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <AppText variant="bodyStrong" color={Colors.accentYellow}>
                                        {i + 1}
                                    </AppText>
                                </View>
                                <AppText variant="body" style={styles.stepText}>
                                    {txt}
                                </AppText>
                            </View>
                        ))}
                    </Card>

                    <Button
                        title="Tahtayı Aç"
                        onPress={() => setPhase('board')}
                        icon={<Ionicons name="navigate" size={18} color={Colors.textOnAccent} />}
                    />
                </View>
            </Screen>
        );
    }

    // --- Portrait board: pivot at top-center, fan sweeps downward ---
    const cx = SCREEN_W / 2;
    const rOuter = SCREEN_W / 2 - 36;
    const rInner = rOuter * 0.7;
    const rNumbers = rOuter * 0.45;
    const boardHeight = rOuter + 40;
    // Vertically centre the fan, but never under the top inset / close button.
    const cy = Math.max(insets.top + 64, (SCREEN_H - boardHeight) / 2);

    const arcStart = 2;
    const arcEnd = 178;
    const arcRange = arcEnd - arcStart;

    const arcPath = (r: number) => {
        const s = (arcStart * Math.PI) / 180;
        const e = (arcEnd * Math.PI) / 180;
        return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`;
    };

    return (
        <GradientBackground stars={30}>
            <StatusBar hidden />
            <View style={styles.boardContainer}>
                <Svg width={SCREEN_W} height={SCREEN_H}>
                    {/* Arcs */}
                    <Path d={arcPath(rOuter)} stroke={Colors.borderAccent} strokeWidth={1.5} fill="none" />
                    <Path d={arcPath(rInner)} stroke={Colors.purpleA25} strokeWidth={1} fill="none" />
                    <Path d={arcPath(rNumbers)} stroke={Colors.purpleA15} strokeWidth={0.75} fill="none" />

                    {/* Letters */}
                    {LETTERS.map((letter, i) => {
                        const angle = arcStart + (i / (LETTERS.length - 1)) * arcRange;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = cx + (rInner + 3) * Math.cos(rad);
                        const y1 = cy + (rInner + 3) * Math.sin(rad);
                        const x2 = cx + (rOuter - 3) * Math.cos(rad);
                        const y2 = cy + (rOuter - 3) * Math.sin(rad);
                        const labelR = rOuter + 15;
                        const lx = cx + labelR * Math.cos(rad);
                        const ly = cy + labelR * Math.sin(rad);
                        return (
                            <G key={`l-${i}`}>
                                <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={Colors.purpleLight} strokeWidth={1.5} />
                                <SvgText
                                    x={lx}
                                    y={ly + 5}
                                    textAnchor="middle"
                                    fontSize={13}
                                    fontWeight="700"
                                    fill={Colors.textPrimary}
                                    rotation={angle - 90}
                                    origin={`${lx}, ${ly}`}
                                >
                                    {letter}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* Numbers */}
                    {NUMBERS.map((num, i) => {
                        const angle = arcStart + (i / (NUMBERS.length - 1)) * arcRange;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = cx + (rNumbers + 3) * Math.cos(rad);
                        const y1 = cy + (rNumbers + 3) * Math.sin(rad);
                        const x2 = cx + (rInner - 3) * Math.cos(rad);
                        const y2 = cy + (rInner - 3) * Math.sin(rad);
                        const labelR = (rNumbers + rInner) / 2;
                        const lx = cx + labelR * Math.cos(rad);
                        const ly = cy + labelR * Math.sin(rad);
                        return (
                            <G key={`n-${i}`}>
                                <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={Colors.purpleA25} strokeWidth={1} />
                                <SvgText
                                    x={lx}
                                    y={ly + 5}
                                    textAnchor="middle"
                                    fontSize={14}
                                    fontWeight="600"
                                    fill={Colors.accentYellow}
                                    rotation={angle - 90}
                                    origin={`${lx}, ${ly}`}
                                >
                                    {num}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* EVET (left) / HAYIR (right) near the pivot */}
                    <SvgText
                        x={cx - rNumbers * 0.5}
                        y={cy + rNumbers * 0.62}
                        textAnchor="middle"
                        fontSize={18}
                        fontWeight="800"
                        fill={Colors.success}
                    >
                        EVET
                    </SvgText>
                    <SvgText
                        x={cx + rNumbers * 0.5}
                        y={cy + rNumbers * 0.62}
                        textAnchor="middle"
                        fontSize={18}
                        fontWeight="800"
                        fill={Colors.error}
                    >
                        HAYIR
                    </SvgText>

                    {/* Center divider */}
                    <Line x1={cx} y1={cy + 16} x2={cx} y2={cy + rNumbers - 14} stroke={Colors.purpleA15} strokeWidth={0.8} />

                    {/* Pivot */}
                    <Circle cx={cx} cy={cy} r={13} fill={Colors.purpleA25} stroke={Colors.accentYellow} strokeWidth={2} />
                    <Circle cx={cx} cy={cy} r={3.5} fill={Colors.accentYellow} />
                    <SvgText x={cx} y={cy - 22} textAnchor="middle" fontSize={10} fill={Colors.textMuted}>
                        Sarkaç noktası
                    </SvgText>
                </Svg>

                {/* Close button — plain (unrotated) view, large hit area */}
                <TouchableOpacity
                    style={[styles.closeBtn, { top: insets.top + 8 }]}
                    onPress={() => setPhase('intro')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Tahtayı kapat"
                >
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>

                {/* Bottom hint */}
                <View style={[styles.hint, { bottom: insets.bottom + 20 }]}>
                    <Ionicons name="phone-portrait-outline" size={16} color={Colors.textMuted} />
                    <AppText variant="caption" center style={styles.hintText}>
                        Telefonu düz bir yüzeye yatırın ve sarkacı orta noktadan sarkıtın.
                    </AppText>
                </View>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    introBody: { gap: Spacing.lg, alignItems: 'center', paddingTop: Spacing.xl },
    introIcon: {
        width: 96,
        height: 96,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.goldA12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    introSub: { paddingHorizontal: Spacing.md },
    stepsCard: { width: '100%', gap: Spacing.lg },
    stepItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.purpleA25,
        borderWidth: 1,
        borderColor: Colors.purple,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: { flex: 1 },
    boardContainer: { flex: 1 },
    closeBtn: {
        position: 'absolute',
        right: Spacing.lg,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.whiteA12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hint: {
        position: 'absolute',
        left: Spacing.xl,
        right: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    hintText: { flexShrink: 1 },
});
