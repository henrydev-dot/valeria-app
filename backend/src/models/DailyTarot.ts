import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyTarot extends Document {
    userId: string;
    date: string; // YYYY-MM-DD
    cardId: number;
    isReversed: boolean;
    dailyMessage: string;
    createdAt: Date;
}

const DailyTarotSchema = new Schema<IDailyTarot>({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    cardId: { type: Number, required: true },
    isReversed: { type: Boolean, default: false },
    dailyMessage: { type: String, default: '' }
}, {
    timestamps: true
});

// Aynı kullanıcı aynı gün sadece 1 kart
DailyTarotSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyTarot = mongoose.model<IDailyTarot>('DailyTarot', DailyTarotSchema);
