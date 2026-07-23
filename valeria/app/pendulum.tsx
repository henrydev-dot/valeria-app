import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton } from '../src/components';
import { Colors } from '../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../src/theme/spacing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// In landscape: long edge = horizontal, short edge = vertical
const VW = SCREEN_H; // rotated width (long edge)
const VH = SCREEN_W; // rotated height (short edge)

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function PendulumScreen() {
    const [phase, setPhase] = useState<'intro' | 'board'>('intro');

    if (phase === 'intro') {
        return (
            <GradientBackground>
                <View style={styles.introContainer}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.introContent}>
                        <Ionicons name="navigate-outline" size={80} color={Colors.accentYellow} />
                        <Text style={styles.introTitle}>Sarkac Tahtasi</Text>
                        <View style={styles.stepList}>
                            {[
                                'Telefonunuzu duz bir yere yatirin.',
                                'Kolye veya sarkacinizi ekranin ortasindan sarkitin.',
                                'Enerjinizi odaklayip sorunuzu zihninizde sorun.',
                                'Sarkacin hangi harf, sayi veya cevaba gittigini izleyin.',
                            ].map((txt, i) => (
                                <View key={i} style={styles.stepItem}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumText}>{i + 1}</Text>
                                    </View>
                                    <Text style={styles.stepText}>{txt}</Text>
                                </View>
                            ))}
                        </View>
                        <PrimaryButton title="Tahtayi Ac" onPress={() => setPhase('board')} />
                    </View>
                </View>
            </GradientBackground>
        );
    }

    // --- Landscape Board (rotated 90°) ---
    // Pivot at center of the long top edge
    const cx = VW / 2;
    const cy = 24;

    // Radius: as large as vertical space allows
    const rOuter = VH - cy - 18;
    const rInner = rOuter * 0.7;
    const rNumbers = rOuter * 0.45;

    // Arc: 2° to 178° (nearly full semicircle, 0°=right, 90°=down, 180°=left)
    const arcStart = 2;
    const arcEnd = 178;
    const arcRange = arcEnd - arcStart;

    return (
        <View style={styles.boardOuter}>
            <StatusBar hidden />
            {/* Rotated container: makes the long phone edge horizontal */}
            <View style={[styles.boardRotated, {
                width: VW,
                height: VH,
                transform: [{ rotate: '90deg' }],
            }]}>
                {/* Close button */}
                <TouchableOpacity
                    style={styles.boardClose}
                    onPress={() => setPhase('intro')}
                >
                    <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>

                <Svg width={VW} height={VH}>
                    {/* Outer arc */}
                    {(() => {
                        const s = (arcStart * Math.PI) / 180;
                        const e = (arcEnd * Math.PI) / 180;
                        return (
                            <Path
                                d={`M ${cx + rOuter * Math.cos(s)} ${cy + rOuter * Math.sin(s)} A ${rOuter} ${rOuter} 0 1 1 ${cx + rOuter * Math.cos(e)} ${cy + rOuter * Math.sin(e)}`}
                                stroke={Colors.purple + '40'}
                                strokeWidth={1.5}
                                fill="none"
                            />
                        );
                    })()}

                    {/* Inner arc */}
                    {(() => {
                        const s = (arcStart * Math.PI) / 180;
                        const e = (arcEnd * Math.PI) / 180;
                        return (
                            <Path
                                d={`M ${cx + rInner * Math.cos(s)} ${cy + rInner * Math.sin(s)} A ${rInner} ${rInner} 0 1 1 ${cx + rInner * Math.cos(e)} ${cy + rInner * Math.sin(e)}`}
                                stroke={Colors.purple + '25'}
                                strokeWidth={1}
                                fill="none"
                            />
                        );
                    })()}

                    {/* Number arc */}
                    {(() => {
                        const s = (arcStart * Math.PI) / 180;
                        const e = (arcEnd * Math.PI) / 180;
                        return (
                            <Path
                                d={`M ${cx + rNumbers * Math.cos(s)} ${cy + rNumbers * Math.sin(s)} A ${rNumbers} ${rNumbers} 0 1 1 ${cx + rNumbers * Math.cos(e)} ${cy + rNumbers * Math.sin(e)}`}
                                stroke={Colors.purple + '15'}
                                strokeWidth={0.5}
                                fill="none"
                            />
                        );
                    })()}

                    {/* Letter tick marks & labels (between inner and outer arcs) */}
                    {LETTERS.map((letter, i) => {
                        const angle = arcStart + (i / (LETTERS.length - 1)) * arcRange;
                        const rad = (angle * Math.PI) / 180;

                        // Tick line
                        const x1 = cx + (rInner + 3) * Math.cos(rad);
                        const y1 = cy + (rInner + 3) * Math.sin(rad);
                        const x2 = cx + (rOuter - 3) * Math.cos(rad);
                        const y2 = cy + (rOuter - 3) * Math.sin(rad);

                        // Label outside
                        const labelR = rOuter + 14;
                        const lx = cx + labelR * Math.cos(rad);
                        const ly = cy + labelR * Math.sin(rad);
                        const rotation = angle - 90;

                        return (
                            <G key={`l-${i}`}>
                                <Line x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={Colors.purpleLight} strokeWidth={1.5} />
                                <SvgText
                                    x={lx} y={ly + 5}
                                    textAnchor="middle"
                                    fontSize={13}
                                    fontWeight="700"
                                    fill={Colors.textPrimary}
                                    rotation={rotation}
                                    origin={`${lx}, ${ly}`}
                                >
                                    {letter}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* Number tick marks & labels */}
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
                        const rotation = angle - 90;

                        return (
                            <G key={`n-${i}`}>
                                <Line x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke={Colors.purple + '40'} strokeWidth={1} />
                                <SvgText
                                    x={lx} y={ly + 5}
                                    textAnchor="middle"
                                    fontSize={14}
                                    fontWeight="600"
                                    fill={Colors.accentYellow}
                                    rotation={rotation}
                                    origin={`${lx}, ${ly}`}
                                >
                                    {num}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* EVET — left side */}
                    <SvgText
                        x={cx - rNumbers * 0.5}
                        y={cy + rNumbers * 0.6}
                        textAnchor="middle"
                        fontSize={18}
                        fontWeight="800"
                        fill="#34D399"
                    >
                        EVET
                    </SvgText>

                    {/* HAYIR — right side */}
                    <SvgText
                        x={cx + rNumbers * 0.5}
                        y={cy + rNumbers * 0.6}
                        textAnchor="middle"
                        fontSize={18}
                        fontWeight="800"
                        fill="#EF4444"
                    >
                        HAYIR
                    </SvgText>

                    {/* Center divider */}
                    <Line x1={cx} y1={cy + 16} x2={cx} y2={cy + rNumbers - 15}
                        stroke={Colors.purple + '20'} strokeWidth={0.8} />

                    {/* Pivot circle */}
                    <Circle cx={cx} cy={cy} r={12} fill={Colors.purple + '20'} stroke={Colors.accentYellow} strokeWidth={2} />
                    <Circle cx={cx} cy={cy} r={3.5} fill={Colors.accentYellow} />

                    {/* Guide text */}
                    <SvgText x={cx} y={cy + 30} textAnchor="middle" fontSize={8} fill={Colors.textMuted}>
                        Sarkac noktasi
                    </SvgText>
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    introContainer: { flex: 1, paddingHorizontal: Spacing.xxl, paddingTop: 60 },
    backBtn: { marginBottom: Spacing.xl },
    introContent: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xl, paddingBottom: 80,
    },
    introTitle: { fontSize: FontSize.hero, fontWeight: '700', color: Colors.textPrimary },
    stepList: { width: '100%', gap: Spacing.lg },
    stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    stepNumber: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.purple + '30', borderWidth: 1, borderColor: Colors.purple,
        alignItems: 'center', justifyContent: 'center',
    },
    stepNumText: { fontSize: 13, fontWeight: '700', color: Colors.accentYellow },
    stepText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
    boardOuter: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boardRotated: {
        backgroundColor: Colors.backgroundDark,
    },
    boardClose: {
        position: 'absolute', bottom: 12, left: 12, zIndex: 10,
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
});
