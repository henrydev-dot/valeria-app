import mongoose, { Schema, Document } from 'mongoose';

export interface IRequestCard {
    name: string;
    isReversed: boolean;
    position: string; // Geçmiş | Şimdi | Gelecek
}

export interface IReadingRequest extends Document {
    userId: string;
    advisorId: string; // 'valeria' | insan danışman advisorId ('1','2',...)
    advisorName: string;
    type: string; // 'tarot' | 'coffee' | 'kahve' | 'sarkac' | 'advisor_session'
    question: string;
    status: 'pending' | 'answered';
    answer: string;
    createdAt: Date;
    answeredAt: Date | null;
    images?: string[];
    cards?: IRequestCard[]; // tarot isteklerinde sunucuda çekilen kartlar
    creditsCharged: number; // iade gerektiğinde (ör. geçersiz fincan) kullanılır
}

const ReadingRequestSchema = new Schema<IReadingRequest>({
    userId: { type: String, required: true, index: true },
    advisorId: { type: String, required: true },
    advisorName: { type: String, default: '' },
    type: { type: String, required: true, enum: ['tarot', 'coffee', 'kahve', 'sarkac', 'advisor_session'] },
    question: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'answered'] },
    answer: { type: String, default: '' },
    answeredAt: { type: Date, default: null },
    images: { type: [String], default: [] },
    cards: {
        type: [{
            name: { type: String, required: true },
            isReversed: { type: Boolean, default: false },
            position: { type: String, default: '' },
        }],
        default: [],
    },
    creditsCharged: { type: Number, default: 0 },
}, {
    timestamps: true
});

export const ReadingRequest = mongoose.model<IReadingRequest>('ReadingRequest', ReadingRequestSchema);
