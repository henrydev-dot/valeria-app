import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    // Auth
    email: string;
    password: string;
    appleId?: string;
    refreshToken?: string;

    // Profile
    name: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    birthCity: string;
    birthDistrict: string;
    birthCountry: string;
    latitude: string;
    longitude: string;
    relationshipStatus: string;
    workStatus: string;

    // Astrology (backend hesaplar - onboarding'de)
    deityResult: string;
    deityName: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    element: string;
    energyScore: number;
    numerologyAI?: any; // To store purchased AI numerology

    // Status
    onboardingComplete: boolean;
    membershipType: string; // "free" | "premium"
    avatarUrl: string;
    pushToken: string;

    // Entitlements
    credits: number;
    xp: number;
    level: number;
    streakDays: number;
    dailyQuestionsRemaining: number;
    freeQuestionUsed: boolean;
    lastDailyRewardAt?: Date | null;
    processedTransactionIds: string[];
    unlockedContentIds: string[];
    lastResetDate: Date;
    lastLoginDate: Date;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    // Auth
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    appleId: { type: String, unique: true, sparse: true },
    refreshToken: { type: String },

    // Profile
    name: { type: String, required: true },
    gender: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    birthTime: { type: String, default: '' },
    birthCity: { type: String, default: '' },
    birthDistrict: { type: String, default: '' },
    birthCountry: { type: String, default: 'Türkiye' },
    latitude: { type: String, default: '' },
    longitude: { type: String, default: '' },
    relationshipStatus: { type: String, default: '' },
    workStatus: { type: String, default: '' },

    // Astrology
    deityResult: { type: String, default: '' },
    deityName: { type: String, default: '' },
    sunSign: { type: String, default: '' },
    moonSign: { type: String, default: '' },
    risingSign: { type: String, default: '' },
    element: { type: String, default: 'Ateş' },
    energyScore: { type: Number, default: 85 },
    numerologyAI: { type: Schema.Types.Mixed },

    // Status
    onboardingComplete: { type: Boolean, default: false },
    membershipType: { type: String, default: 'free' },
    avatarUrl: { type: String, default: '' },
    pushToken: { type: String, default: '' },

    // Entitlements
    credits: { type: Number, default: 500 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    dailyQuestionsRemaining: { type: Number, default: 0 },
    freeQuestionUsed: { type: Boolean, default: false },
    lastDailyRewardAt: { type: Date, default: null },
    processedTransactionIds: { type: [String], default: [] },
    unlockedContentIds: [{ type: String }],
    lastResetDate: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
