export interface UserInput {
    name: string;
    birthDate: string; // YYYY-MM-DD
    birthTime: string; // HH:MM
    birthCity: string;
    birthDistrict?: string;
    birthCountry?: string; // Saat dilimi seçimi için (Türkiye dışı → boylamdan tahmin)
    latitude: string;
    longitude: string;
    gender: string;
    relationshipStatus: string;
    jobStatus: string;
}

export enum Element {
    Fire = "Ateş",
    Earth = "Toprak",
    Air = "Hava",
    Water = "Su"
}

export enum Modality {
    Cardinal = "Öncü",
    Fixed = "Sabit",
    Mutable = "Değişken"
}

export interface TengriOracle {
    cardName: string;
    keywords: string[];
    description: string;
    symbolism: string;
    shadow: string;
}

export interface SignData {
    name: string;
    element: Element;
    modality: Modality;
    ruler: string;
    mythology: {
        greek: string;
        archetype: string;
    };
    tarot: {
        card: string;
        theme: string;
    };
    tengriOracle: TengriOracle;
}

export interface PlanetPosition {
    planet: string;
    planetNameTR: string;
    sign: string;
    degree: number;
    totalDegree: number;
    house: number;
    retrograde: boolean;
}

export interface HouseData {
    houseNumber: number;
    sign: string;
    meaning: string;
}

export interface AspectData {
    planet1: string;
    planet2: string;
    type: "Conjunction" | "Opposition" | "Square" | "Trine" | "Sextile";
    angle: number;
    orb: number;
    interpretation: string;
    isMajor: boolean;
}

export interface TransitData {
    transitPlanet: string;
    natalPlanet: string;
    type: AspectData['type'];
    orb: number;
    interpretation: string;
}

export interface NumerologyData {
    lifePath: number;
    destiny: number;
    soulUrge: number;
}

export interface AnalysisResult {
    astrology: {
        sun: PlanetPosition;
        moon: PlanetPosition;
        rising: PlanetPosition;
        planets: PlanetPosition[];
        houses: HouseData[];
        aspects: AspectData[];
        transits: TransitData[];
        bigThreeSummary: string;
    };
    numerology: NumerologyData;
    mythology: {
        primaryArchetype: string;
        godMapping: string;
        tarotCard: string;
        tengriCard: TengriOracle;
    };
    aiInterpretation: {
        personalitySummary: string;
        detailedAnalysis: string;
        strengths: string[];
        challenges: string[];
        prediction: string;
        relationshipAnalysis: {
            mistakes: string;
            idealPartner: string;
            attractionDynamics: string;
        };
    };
}
