import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, Screen, Header, AppText, Button, Card } from '../src/components';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius } from '../src/theme/spacing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// --- Landscape board geometry -------------------------------------------------
// The phone stays physically portrait; we draw the board rotated 90deg so the
// LONG screen edge becomes the board's width. The rotated container is sized
// width = SCREEN_H, height = SCREEN_W, so after the rotation its bounding box is
// exactly SCREEN_W x SCREEN_H — it fills the screen edge-to-edge, no empty bands.
const BOARD_W = SCREEN_H; // landscape width  (long edge)
const BOARD_H = SCREEN_W; // landscape height (short edge)

const CX = BOARD_W / 2; // pivot x — horizontal centre
const CY = 34; // pivot y — near the top, fan opens downward
const OUTER_LABEL_PAD = 22; // room for the letter labels drawn beyond rOuter
const BOTTOM_PAD = 24; // room for the instruction line under the arc

// Radius bound by BOTH the (short) height and the (long) width so nothing clips.
const R_OUTER = Math.min(
    BOARD_H - CY - OUTER_LABEL_PAD - BOTTOM_PAD, // vertical fit (binding on tall phones)
    BOARD_W / 2 - OUTER_LABEL_PAD - 12, // horizontal fit
);
const R_INNER = R_OUTER * 0.7;
const R_NUMBERS = R_OUTER * 0.45;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const STEPS = [
    'Telefonunuzu düz bir yüzeye yatırın.',
    'Kolyenizi veya sarkacınızı ekranın ortasındaki noktadan sarkıtın.',
    'Enerjinizi odaklayıp sorunuzu zihninizde sorun.',
    'Sarkacın yöneldiği harf, sayı veya cevabı izleyin.',
];

// Downward semicircle: 2° -> 178° with +y pointing down (right -> bottom -> left).
const ARC_START = 2;
const ARC_END = 178;
const ARC_RANGE = ARC_END - ARC_START;

const arcPath = (r: number) => {
    const s = (ARC_START * Math.PI) / 180;
    const e = (ARC_END * Math.PI) / 180;
    return `M ${CX + r * Math.cos(s)} ${CY + r * Math.sin(s)} A ${r} ${r} 0 1 1 ${CX + r * Math.cos(e)} ${CY + r * Math.sin(e)}`;
};

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

    // --- Full-bleed landscape board ---
    return (
        <GradientBackground stars={30}>
            <StatusBar hidden />

            {/* Rotated board: sized to the screen so the 90deg rotation fills it. */}
            <View style={styles.rotatedBoard} pointerEvents="none">
                <Svg width={BOARD_W} height={BOARD_H}>
                    {/* Arcs */}
                    <Path d={arcPath(R_OUTER)} stroke={Colors.borderAccent} strokeWidth={1.5} fill="none" />
                    <Path d={arcPath(R_INNER)} stroke={Colors.purpleA25} strokeWidth={1} fill="none" />
                    <Path d={arcPath(R_NUMBERS)} stroke={Colors.purpleA15} strokeWidth={0.75} fill="none" />

                    {/* Letters (outer ring) */}
                    {LETTERS.map((letter, i) => {
                        const angle = ARC_START + (i / (LETTERS.length - 1)) * ARC_RANGE;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = CX + (R_INNER + 4) * Math.cos(rad);
                        const y1 = CY + (R_INNER + 4) * Math.sin(rad);
                        const x2 = CX + (R_OUTER - 4) * Math.cos(rad);
                        const y2 = CY + (R_OUTER - 4) * Math.sin(rad);
                        const labelR = R_OUTER + 14;
                        const lx = CX + labelR * Math.cos(rad);
                        const ly = CY + labelR * Math.sin(rad);
                        return (
                            <G key={`l-${i}`}>
                                <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={Colors.purpleLight} strokeWidth={1.25} />
                                <SvgText
                                    x={lx}
                                    y={ly + 5}
                                    textAnchor="middle"
                                    fontSize={15}
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

                    {/* Numbers (middle ring) */}
                    {NUMBERS.map((num, i) => {
                        const angle = ARC_START + (i / (NUMBERS.length - 1)) * ARC_RANGE;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = CX + (R_NUMBERS + 3) * Math.cos(rad);
                        const y1 = CY + (R_NUMBERS + 3) * Math.sin(rad);
                        const x2 = CX + (R_INNER - 3) * Math.cos(rad);
                        const y2 = CY + (R_INNER - 3) * Math.sin(rad);
                        const labelR = (R_NUMBERS + R_INNER) / 2;
                        const lx = CX + labelR * Math.cos(rad);
                        const ly = CY + labelR * Math.sin(rad);
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

                    {/* EVET (left / green) & HAYIR (right / red) near the pivot */}
                    <SvgText
                        x={CX - R_NUMBERS * 0.5}
                        y={CY + R_NUMBERS * 0.62}
                        textAnchor="middle"
                        fontSize={19}
                        fontWeight="800"
                        fill={Colors.success}
                    >
                        EVET
                    </SvgText>
                    <SvgText
                        x={CX + R_NUMBERS * 0.5}
                        y={CY + R_NUMBERS * 0.62}
                        textAnchor="middle"
                        fontSize={19}
                        fontWeight="800"
                        fill={Colors.error}
                    >
                        HAYIR
                    </SvgText>

                    {/* Center divider between EVET / HAYIR */}
                    <Line x1={CX} y1={CY + 18} x2={CX} y2={CY + R_NUMBERS - 14} stroke={Colors.purpleA15} strokeWidth={0.8} />

                    {/* Pivot ("Sarkaç noktası") */}
                    <Circle cx={CX} cy={CY} r={13} fill={Colors.purpleA25} stroke={Colors.accentYellow} strokeWidth={2} />
                    <Circle cx={CX} cy={CY} r={3.5} fill={Colors.accentYellow} />
                    <SvgText x={CX} y={CY - 20} textAnchor="middle" fontSize={11} fill={Colors.textMuted}>
                        Sarkaç noktası
                    </SvgText>

                    {/* Instruction line, under the arc, reads with the landscape board */}
                    <SvgText
                        x={CX}
                        y={BOARD_H - 12}
                        textAnchor="middle"
                        fontSize={11}
                        fill={Colors.textMuted}
                    >
                        Telefonu düz bir yüzeye yatırın ve sarkacı orta noktadan sarkıtın.
                    </SvgText>
                </Svg>
            </View>

            {/* Close (X) — NON-rotated screen overlay, real top corner, easy to reach */}
            <TouchableOpacity
                style={[styles.closeBtn, { top: insets.top + 8 }]}
                onPress={() => setPhase('intro')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Tahtayı kapat"
            >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
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
    // Rotated so the long screen edge becomes the board width. Centering the
    // (SCREEN_H x SCREEN_W) box on the screen means the 90deg rotation lands its
    // bounding box exactly on the screen rect — no empty margins.
    rotatedBoard: {
        position: 'absolute',
        width: BOARD_W,
        height: BOARD_H,
        left: (SCREEN_W - BOARD_W) / 2,
        top: (SCREEN_H - BOARD_H) / 2,
        transform: [{ rotate: '90deg' }],
    },
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
});
