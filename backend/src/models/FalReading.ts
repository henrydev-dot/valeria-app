import mongoose, { Schema, Document } from 'mongoose';

// Horary question sub-document
export interface IHoraryQuestion {
    question: string;
    answer: string;
    creditCost: number;
    createdAt: Date;
}

const HoraryQuestionSchema = new Schema<IHoraryQuestion>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    creditCost: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

// Full reading document - stores ALL data that was visible on the website
export interface IFalReading extends Document {
    userId: string;

    // User input at time of reading
    userInput: {
        name: string;
        birthDate: string;
        birthTime: string;
        birthCity: string;
        latitude: string;
        longitude: string;
        gender: string;
        relationshipStatus: string;
        jobStatus: string;
    };

    // Full astrology data
    astrology: {
        sun: {
            planet: string;
            planetNameTR: string;
            sign: string;
            degree: number;
            totalDegree: number;
            house: number;
            retrograde: boolean;
        };
        moon: {
            planet: string;
            planetNameTR: string;
            sign: string;
            degree: number;
            totalDegree: number;
            house: number;
            retrograde: boolean;
        };
        rising: {
            planet: string;
            planetNameTR: string;
            sign: string;
            degree: number;
            totalDegree: number;
            house: number;
            retrograde: boolean;
        };
        planets: Array<{
            planet: string;
            planetNameTR: string;
            sign: string;
            degree: number;
            totalDegree: number;
            house: number;
            retrograde: boolean;
        }>;
        houses: Array<{
            houseNumber: number;
            sign: string;
            meaning: string;
        }>;
        aspects: Array<{
            planet1: string;
            planet2: string;
            type: string;
            angle: number;
            orb: number;
            interpretation: string;
            isMajor: boolean;
        }>;
        transits: Array<{
            transitPlanet: string;
            natalPlanet: string;
            type: string;
            orb: number;
            interpretation: string;
        }>;
        bigThreeSummary: string;
    };

    // Numerology
    numerology: {
        lifePath: number;
        destiny: number;
        soulUrge: number;
    };

    // Mythology
    mythology: {
        primaryArchetype: string;
        godMapping: string;
        tarotCard: string;
        tengriCard: {
            cardName: string;
            keywords: string[];
            description: string;
            symbolism: string;
            shadow: string;
        };
    };

    // AI Interpretation
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

    // Horary questions asked on this reading
    horaryQuestions: IHoraryQuestion[];

    createdAt: Date;
}

const PlanetPositionSchema = new Schema({
    planet: String,
    planetNameTR: String,
    sign: String,
    degree: Number,
    totalDegree: Number,
    house: Number,
    retrograde: Boolean
}, { _id: false });

const HouseSchema = new Schema({
    houseNumber: Number,
    sign: String,
    meaning: String
}, { _id: false });

const AspectSchema = new Schema({
    planet1: String,
    planet2: String,
    type: String,
    angle: Number,
    orb: Number,
    interpretation: String,
    isMajor: Boolean
}, { _id: false });

const TransitSchema = new Schema({
    transitPlanet: String,
    natalPlanet: String,
    type: String,
    orb: Number,
    interpretation: String
}, { _id: false });

const TengriCardSchema = new Schema({
    cardName: String,
    keywords: [String],
    description: String,
    symbolism: String,
    shadow: String
}, { _id: false });

const FalReadingSchema = new Schema<IFalReading>({
    userId: { type: String, required: true, index: true },

    userInput: {
        name: String,
        birthDate: String,
        birthTime: String,
        birthCity: String,
        latitude: String,
        longitude: String,
        gender: String,
        relationshipStatus: String,
        jobStatus: String
    },

    astrology: {
        sun: PlanetPositionSchema,
        moon: PlanetPositionSchema,
        rising: PlanetPositionSchema,
        planets: [PlanetPositionSchema],
        houses: [HouseSchema],
        aspects: [AspectSchema],
        transits: [TransitSchema],
        bigThreeSummary: String
    },

    numerology: {
        lifePath: Number,
        destiny: Number,
        soulUrge: Number
    },

    mythology: {
        primaryArchetype: String,
        godMapping: String,
        tarotCard: String,
        tengriCard: TengriCardSchema
    },

    aiInterpretation: {
        personalitySummary: String,
        detailedAnalysis: String,
        strengths: [String],
        challenges: [String],
        prediction: String,
        relationshipAnalysis: {
            mistakes: String,
            idealPartner: String,
            attractionDynamics: String
        }
    },

    horaryQuestions: [HoraryQuestionSchema]
}, {
    timestamps: true
});

export const FalReading = mongoose.model<IFalReading>('FalReading', FalReadingSchema);
