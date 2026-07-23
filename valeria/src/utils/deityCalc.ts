import { Deity } from '../types';

interface TraitScores {
    Power: number;
    Wisdom: number;
    Freedom: number;
    Emotion: number;
    Order: number;
    Adventure: number;
}

/**
 * Calculate deity match from accumulated quiz trait scores.
 */
export function calculateDeity(
    traitScores: TraitScores,
    deities: Deity[]
): Deity | null {
    if (!deities || deities.length === 0) return null;

    // Sort traits by score (highest first)
    const sortedTraits = Object.entries(traitScores)
        .sort(([, a], [, b]) => b - a)
        .map(([trait]) => trait);

    const topTwo = sortedTraits.slice(0, 2);

    // Find best matching deity
    let bestMatch: Deity | null = null;
    let bestScore = -1;

    for (const deity of deities) {
        let score = 0;
        for (let i = 0; i < topTwo.length; i++) {
            if (deity.primaryTraits.includes(topTwo[i])) {
                score += (2 - i); // Higher weight for top trait
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = deity;
        }
    }

    return bestMatch;
}

/**
 * Calculate energy score (0–100) based on goals and trait balance.
 */
export function calculateEnergyScore(
    goals: string[],
    traitScores: TraitScores
): number {
    // Base energy from number of goals selected (more = higher engagement)
    const goalBonus = Math.min(goals.length * 8, 40);

    // Trait balance score (more balanced = higher energy)
    const values = Object.values(traitScores);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const total = values.reduce((a, b) => a + b, 0);
    const balanceScore = total > 0 ? Math.round(((total - (max - min)) / total) * 40) : 20;

    // Random variance for demo
    const variance = Math.floor(Math.random() * 20);

    return Math.min(goalBonus + balanceScore + variance, 100);
}
