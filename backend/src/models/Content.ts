import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
    contentId: string;
    category: string; // "crystal" | "rune" | "ritual"
    title: string;
    description: string;
    detail: string;
    gradient: string[];
    isFree: boolean;
    unlockCost: number;
    tip: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
    contentId: { type: String, required: true, unique: true },
    category: { type: String, required: true, enum: ['crystal', 'rune', 'ritual'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    detail: { type: String, default: '' },
    gradient: [{ type: String }],
    isFree: { type: Boolean, default: false },
    unlockCost: { type: Number, default: 10 },
    tip: { type: String, default: '' }
}, {
    timestamps: true
});

export const Content = mongoose.model<IContent>('Content', ContentSchema);
