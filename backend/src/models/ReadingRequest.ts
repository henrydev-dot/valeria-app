import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingRequest extends Document {
    userId: string;
    advisorId: string; // 'ayse', 'mehmet', 'elif'
    type: string; // 'tarot' | 'coffee'
    question: string;
    status: 'pending' | 'answered';
    answer: string;
    createdAt: Date;
    answeredAt: Date | null;
    images?: string[];
}

const ReadingRequestSchema = new Schema<IReadingRequest>({
    userId: { type: String, required: true, index: true },
    advisorId: { type: String, required: true },
    type: { type: String, required: true, enum: ['tarot', 'coffee', 'kahve', 'sarkac'] },
    question: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'answered'] },
    answer: { type: String, default: '' },
    answeredAt: { type: Date, default: null },
    images: { type: [String], default: [] },
}, {
    timestamps: true
});

export const ReadingRequest = mongoose.model<IReadingRequest>('ReadingRequest', ReadingRequestSchema);
