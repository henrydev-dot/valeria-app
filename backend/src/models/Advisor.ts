import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvisor extends Document {
    advisorId: number;
    name: string;
    specialties: string[];
    rating: number;
    sessions: number;
    bio: string;
    packages: Array<{ duration: string; credits: number }>;
    reviews: Array<{ user: string; rating: number; text: string }>;
    createdAt: Date;
    updatedAt: Date;
}

const AdvisorSchema = new Schema<IAdvisor>({
    advisorId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    specialties: [{ type: String }],
    rating: { type: Number, default: 5.0 },
    sessions: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    packages: [{
        duration: String,
        credits: Number,
        _id: false
    }],
    reviews: [{
        user: String,
        rating: Number,
        text: String,
        _id: false
    }]
}, {
    timestamps: true
});

export const Advisor = mongoose.model<IAdvisor>('Advisor', AdvisorSchema);
