/**
 * Fallback birthplace coordinates by country, used when a birth city is not in
 * the Turkish city table. Improves natal-chart accuracy for users born abroad
 * instead of silently defaulting everyone to Istanbul.
 * Keys are lowercased; both Turkish and English country names are included.
 */
export const COUNTRY_COORDS: Record<string, { lat: number; lon: number }> = {
    'türkiye': { lat: 41.0082, lon: 28.9784 },
    'turkey': { lat: 41.0082, lon: 28.9784 },
    'almanya': { lat: 52.52, lon: 13.405 }, 'germany': { lat: 52.52, lon: 13.405 },
    'fransa': { lat: 48.8566, lon: 2.3522 }, 'france': { lat: 48.8566, lon: 2.3522 },
    'i̇ngiltere': { lat: 51.5074, lon: -0.1278 }, 'ingiltere': { lat: 51.5074, lon: -0.1278 }, 'united kingdom': { lat: 51.5074, lon: -0.1278 }, 'uk': { lat: 51.5074, lon: -0.1278 },
    'hollanda': { lat: 52.3676, lon: 4.9041 }, 'netherlands': { lat: 52.3676, lon: 4.9041 },
    'belçika': { lat: 50.8503, lon: 4.3517 }, 'belgium': { lat: 50.8503, lon: 4.3517 },
    'avusturya': { lat: 48.2082, lon: 16.3738 }, 'austria': { lat: 48.2082, lon: 16.3738 },
    'i̇sviçre': { lat: 46.948, lon: 7.4474 }, 'isviçre': { lat: 46.948, lon: 7.4474 }, 'switzerland': { lat: 46.948, lon: 7.4474 },
    'i̇talya': { lat: 41.9028, lon: 12.4964 }, 'italya': { lat: 41.9028, lon: 12.4964 }, 'italy': { lat: 41.9028, lon: 12.4964 },
    'i̇spanya': { lat: 40.4168, lon: -3.7038 }, 'ispanya': { lat: 40.4168, lon: -3.7038 }, 'spain': { lat: 40.4168, lon: -3.7038 },
    'portekiz': { lat: 38.7223, lon: -9.1393 }, 'portugal': { lat: 38.7223, lon: -9.1393 },
    'yunanistan': { lat: 37.9838, lon: 23.7275 }, 'greece': { lat: 37.9838, lon: 23.7275 },
    'bulgaristan': { lat: 42.6977, lon: 23.3219 }, 'bulgaria': { lat: 42.6977, lon: 23.3219 },
    'rusya': { lat: 55.7558, lon: 37.6173 }, 'russia': { lat: 55.7558, lon: 37.6173 },
    'ukrayna': { lat: 50.4501, lon: 30.5234 }, 'ukraine': { lat: 50.4501, lon: 30.5234 },
    'azerbaycan': { lat: 40.4093, lon: 49.8671 }, 'azerbaijan': { lat: 40.4093, lon: 49.8671 },
    'i̇ran': { lat: 35.6892, lon: 51.389 }, 'iran': { lat: 35.6892, lon: 51.389 },
    'irak': { lat: 33.3152, lon: 44.3661 }, 'iraq': { lat: 33.3152, lon: 44.3661 },
    'suriye': { lat: 33.5138, lon: 36.2765 }, 'syria': { lat: 33.5138, lon: 36.2765 },
    'suudi arabistan': { lat: 24.7136, lon: 46.6753 }, 'saudi arabia': { lat: 24.7136, lon: 46.6753 },
    'birleşik arap emirlikleri': { lat: 24.4539, lon: 54.3773 }, 'uae': { lat: 24.4539, lon: 54.3773 },
    'mısır': { lat: 30.0444, lon: 31.2357 }, 'egypt': { lat: 30.0444, lon: 31.2357 },
    'abd': { lat: 38.9072, lon: -77.0369 }, 'amerika': { lat: 38.9072, lon: -77.0369 }, 'usa': { lat: 38.9072, lon: -77.0369 }, 'united states': { lat: 38.9072, lon: -77.0369 },
    'kanada': { lat: 45.4215, lon: -75.6972 }, 'canada': { lat: 45.4215, lon: -75.6972 },
    'çin': { lat: 39.9042, lon: 116.4074 }, 'china': { lat: 39.9042, lon: 116.4074 },
    'japonya': { lat: 35.6762, lon: 139.6503 }, 'japan': { lat: 35.6762, lon: 139.6503 },
    'hindistan': { lat: 28.6139, lon: 77.209 }, 'india': { lat: 28.6139, lon: 77.209 },
    'avustralya': { lat: -35.2809, lon: 149.13 }, 'australia': { lat: -35.2809, lon: 149.13 },
    'brezilya': { lat: -15.7939, lon: -47.8828 }, 'brazil': { lat: -15.7939, lon: -47.8828 },
    'kktc': { lat: 35.1856, lon: 33.3823 }, 'kıbrıs': { lat: 35.1856, lon: 33.3823 }, 'cyprus': { lat: 35.1856, lon: 33.3823 },
};

export function coordsForCountry(country?: string): { lat: number; lon: number } | null {
    if (!country) return null;
    return COUNTRY_COORDS[country.trim().toLocaleLowerCase('tr')] || null;
}
