import { ZodiacSign } from '../types';
import zodiacData from '../../content/zodiac_tr.json';

const signs = zodiacData as ZodiacSign[];

/**
 * Get sun sign from birth date.
 */
export function getSunSign(birthDate: string): ZodiacSign | null {
    if (!birthDate) return null;

    const date = new Date(birthDate);
    const month = date.getMonth() + 1; // 1-indexed
    const day = date.getDate();

    for (const sign of signs) {
        if (sign.startMonth === sign.endMonth) {
            if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) {
                return sign;
            }
        } else if (sign.startMonth < sign.endMonth) {
            if (
                (month === sign.startMonth && day >= sign.startDay) ||
                (month === sign.endMonth && day <= sign.endDay)
            ) {
                return sign;
            }
        } else {
            // Wraps around year (e.g., Capricorn: Dec 22 – Jan 19)
            if (
                (month === sign.startMonth && day >= sign.startDay) ||
                (month === sign.endMonth && day <= sign.endDay)
            ) {
                return sign;
            }
        }
    }

    return signs[0]; // fallback
}

/**
 * Get a placeholder moon sign (simplified — in reality needs full astro calc).
 * We use an offset of +3 from sun sign for demo purposes.
 */
export function getMoonSign(birthDate: string): ZodiacSign | null {
    const sun = getSunSign(birthDate);
    if (!sun) return null;
    const moonIndex = ((sun.id - 1 + 3) % 12);
    return signs.find(s => s.id === moonIndex + 1) || signs[0];
}

/**
 * Get a placeholder rising sign (simplified).
 * Uses birth time hour to offset from sun sign for demo purposes.
 */
export function getRisingSign(birthDate: string, birthTime: string): ZodiacSign | null {
    const sun = getSunSign(birthDate);
    if (!sun) return null;

    let hourOffset = 0;
    if (birthTime) {
        const [hours] = birthTime.split(':').map(Number);
        hourOffset = Math.floor(hours / 2); // 2 hours per sign roughly
    }

    const risingIndex = ((sun.id - 1 + hourOffset) % 12);
    return signs.find(s => s.id === risingIndex + 1) || signs[0];
}

/**
 * Get zodiac sign name from ID.
 */
export function getSignName(signId: number): string {
    const sign = signs.find(s => s.id === signId);
    return sign?.nameTR || 'Bilinmiyor';
}
