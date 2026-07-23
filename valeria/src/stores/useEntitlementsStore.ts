import { create } from 'zustand';
import * as api from '../api';

interface EntitlementsState {
    credits: number;
    xp: number;
    level: number;
    streakDays: number;
    dailyQuestionsRemaining: number;
    unlockedContentIds: string[];
    isLoading: boolean;
    load: () => Promise<void>;
    spendCredits: (amount: number, reason?: string, contentId?: string) => Promise<boolean>;
    earnXP: (xp: number) => Promise<void>;
    addCredits: (amount: number) => void;
    watchAd: () => Promise<boolean>;
    refresh: () => Promise<void>;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
    credits: 0,
    xp: 0,
    level: 1,
    streakDays: 0,
    dailyQuestionsRemaining: 3,
    unlockedContentIds: [],
    isLoading: true,

    load: async () => {
        try {
            set({ isLoading: true });
            const token = await api.getToken();
            if (!token) { set({ isLoading: false }); return; }
            const ent = await api.entitlements.get();
            set({
                credits: ent.credits || 0,
                xp: ent.xp || 0,
                level: ent.level || 1,
                streakDays: ent.streakDays || 0,
                dailyQuestionsRemaining: ent.dailyQuestionsRemaining ?? 3,
                unlockedContentIds: ent.unlockedContentIds || [],
                isLoading: false,
            });
        } catch (e) {
            console.error('Failed to load entitlements:', e);
            set({ isLoading: false });
        }
    },

    refresh: async () => {
        await get().load();
    },

    spendCredits: async (amount, reason = 'generic', contentId) => {
        try {
            const res = await api.entitlements.spend(amount, reason, contentId);
            set({
                credits: res.credits,
                unlockedContentIds: res.unlockedContentIds || get().unlockedContentIds,
            });
            return true;
        } catch (e: any) {
            console.error('Spend failed:', e.message);
            return false;
        }
    },

    earnXP: async (xp) => {
        try {
            const res = await api.entitlements.earn(xp);
            set({ xp: res.xp, level: res.level });
        } catch (e) {
            console.error('Earn XP failed:', e);
        }
    },

    addCredits: (amount: number) => {
        set((state) => ({ credits: state.credits + amount }));
    },

    watchAd: async () => {
        try {
            const res = await api.entitlements.adWatch();
            set({ credits: res.credits });
            return true;
        } catch (e: any) {
            console.error('Ad watch failed:', e.message);
            return false;
        }
    },
}));
