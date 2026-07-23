/**
 * Pythagorean Numerology Calculator
 * Turkish letter support included
 */

// Pythagorean letter values (A=1, B=2, C=3, ..., I=9, J=1, K=2, ...)
const LETTER_VALUES: Record<string, number> = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
    's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    // Turkish special chars
    'ç': 3, 'ş': 1, 'ğ': 7, 'ü': 3, 'ö': 6, 'ı': 9, 'İ': 9,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ı', 'ö', 'ü']);

function reduceToSingle(num: number): number {
    // Master numbers 11, 22, 33 are kept
    if (num === 11 || num === 22 || num === 33) return num;
    while (num > 9) {
        num = String(num).split('').reduce((s, d) => s + parseInt(d), 0);
        if (num === 11 || num === 22 || num === 33) return num;
    }
    return num;
}

/**
 * Life Path Number — sum of birth date digits
 * @param birthDate ISO string e.g. "1990-05-15"
 */
export function calculateLifePath(birthDate: string): number {
    const digits = birthDate.replace(/\D/g, '');
    const sum = digits.split('').reduce((s, d) => s + parseInt(d), 0);
    return reduceToSingle(sum);
}

/**
 * Expression (Destiny) Number — full name letter values
 */
export function calculateExpression(name: string): number {
    const sum = name
        .toLowerCase()
        .split('')
        .reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
    return reduceToSingle(sum);
}

/**
 * Soul Urge Number — only vowels
 */
export function calculateSoulUrge(name: string): number {
    const sum = name
        .toLowerCase()
        .split('')
        .filter(c => VOWELS.has(c))
        .reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
    return reduceToSingle(sum);
}

/**
 * Personality Number — only consonants
 */
export function calculatePersonality(name: string): number {
    const sum = name
        .toLowerCase()
        .split('')
        .filter(c => !VOWELS.has(c) && LETTER_VALUES[c])
        .reduce((s, c) => s + (LETTER_VALUES[c] || 0), 0);
    return reduceToSingle(sum);
}

export interface NumerologyResult {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
}

export function calculateAll(name: string, birthDate: string): NumerologyResult {
    return {
        lifePath: calculateLifePath(birthDate),
        expression: calculateExpression(name),
        soulUrge: calculateSoulUrge(name),
        personality: calculatePersonality(name),
    };
}
