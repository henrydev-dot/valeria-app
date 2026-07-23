// Types used across the app
export interface UserProfile {
    name: string;
    gender: string;
    birthDate: string; // ISO date string
    birthTime: string; // HH:mm
    birthCity: string;
    birthCountry: string;
    relationshipStatus: string;
    workStatus: string;
    deityResult: string; // deity id
    deityName: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    energyScore: number;
    onboardingComplete: boolean;
}

export interface Entitlements {
    credits: number;
    dailyQuestionsRemaining: number;
    streakDays: number;
    xp: number;
    level: number;
    lastResetDate: string; // ISO date string
    lastLoginDate: string;
}

export interface TarotCard {
    id: number;
    nameTR: string;
    nameEN: string;
    keywordsTR: string[];
    uprightTR: string;
    reversedTR: string;
    archetypeTR: string;
    adviceTR: string;
}

export interface TarotReading {
    id: string;
    date: string;
    question: string;
    cards: DrawnCard[];
    type: 'tarot' | 'coffee';
}

export interface DrawnCard {
    card: TarotCard;
    isReversed: boolean;
    interpretation: string;
}

export interface Advisor {
    id: number;
    name: string;
    specialties: string[];
    rating: number;
    sessions: number;
    bio: string;
    packages: { duration: string; credits: number }[];
    reviews: { user: string; rating: number; text: string }[];
}

export interface LearningCard {
    id: string;
    category: string;
    titleTR: string;
    isPaid: boolean;
    priceCredits: number;
    readingTime: string;
    sections: { titleTR: string; contentTR: string }[];
}

export interface ZodiacSign {
    id: number;
    nameTR: string;
    nameEN: string;
    symbol: string;
    dateRange: string;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
    element: string;
    rulingPlanet: string;
    descriptionTR: string;
    compatibleSigns: number[];
}

export interface QuizQuestion {
    id: number;
    questionTR: string;
    options: {
        text: string;
        traits: Record<string, number>;
    }[];
}

export interface Deity {
    id: string;
    nameTR: string;
    titleTR: string;
    primaryTraits: string[];
    descriptionTR: string;
    strengthsTR: string[];
    growthTR: string[];
}

export interface DailyQuestion {
    id: string;
    date: string;
    question: string;
    answer: string;
}

export interface CoffeeReading {
    id: string;
    date: string;
    question: string;
    result: string;
    imageUri?: string;
}

export interface PurchaseLog {
    id: string;
    date: string;
    amount: number;
    packageName: string;
}
