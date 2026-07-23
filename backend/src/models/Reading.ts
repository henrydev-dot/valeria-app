import mongoose, { Schema, Document } from 'mongoose';

export interface IReading extends Document {
    userId: string; // User._id
    type: string; // "tarot" | "coffee" | "question"
    question: string;
    date: Date;

    // Tarot specific
    cards?: Array<{
        card: {
            id: number;
            nameTR: string;
            nameEN: string;
            keywordsTR: string[];
            uprightTR: string;
            reversedTR: string;
            archetypeTR: string;
            adviceTR: string;
        };
        isReversed: boolean;
        interpretation: string;
    }>;

    // Coffee specific
    result?: string;
    imageUri?: string;

    // Question specific
    answer?: string;

    createdAt: Date;
}

const ReadingSchema = new Schema<IReading>({
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['tarot', 'coffee', 'question'] },
    question: { type: String, default: '' },
    date: { type: Date, default: Date.now },

    cards: [{
        card: {
            id: Number,
            nameTR: String,
            nameEN: String,
            keywordsTR: [String],
            uprightTR: String,
            reversedTR: String,
            archetypeTR: String,
            adviceTR: String
        },
        isReversed: Boolean,
        interpretation: String,
        _id: false
    }],

    result: { type: String },
    imageUri: { type: String },
    answer: { type: String }
}, {
    timestamps: true
});

export const Reading = mongoose.model<IReading>('Reading', ReadingSchema);
