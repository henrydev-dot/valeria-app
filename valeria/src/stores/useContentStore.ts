import { create } from 'zustand';
import * as api from '../api';
import { ContentRepository } from '../repositories/ContentRepository';

interface ContentItem {
    _id: string;
    contentId: string;
    category: string;
    title: string;
    description: string;
    detail?: string;
    gradient?: string[];
    isFree: boolean;
    unlockCost: number;
    tip?: string;
    isUnlocked: boolean;
}

interface QuestionRecord {
    id: string;
    date: string;
    question: string;
    answer: string;
}

interface ContentState {
    crystals: ContentItem[];
    runes: ContentItem[];
    rituals: ContentItem[];
    homeTemplates: any;
    questions: QuestionRecord[];
    isLoading: boolean;
    loadAll: () => Promise<void>;
    loadCategory: (category: string) => Promise<void>;
    unlockContent: (contentId: string) => Promise<ContentItem | null>;
    randomRune: () => Promise<ContentItem | null>;
    addQuestion: (q: QuestionRecord) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
    crystals: [],
    runes: [],
    rituals: [],
    homeTemplates: null,
    questions: [],
    isLoading: true,

    loadAll: async () => {
        try {
            set({ isLoading: true });
            const token = await api.getToken();

            // Always load home templates from local JSON
            try {
                const templates = await ContentRepository.getHomeTemplates();
                set({ homeTemplates: templates });
            } catch (e) {
                console.warn('Failed to load home templates:', e);
            }

            if (!token) { set({ isLoading: false }); return; }
            const [crystals, runes, rituals] = await Promise.all([
                api.content.list('crystal'),
                api.content.list('rune'),
                api.content.list('ritual'),
            ]);
            set({ crystals, runes, rituals, isLoading: false });
        } catch (e) {
            console.error('Failed to load content:', e);
            set({ isLoading: false });
        }
    },

    loadCategory: async (category) => {
        try {
            const items = await api.content.list(category);
            if (category === 'crystal') set({ crystals: items });
            else if (category === 'rune') set({ runes: items });
            else if (category === 'ritual') set({ rituals: items });
        } catch (e) {
            console.error('Failed to load category:', e);
        }
    },

    unlockContent: async (contentId) => {
        try {
            const item = await api.content.unlock(contentId);
            // Reload the category to update state
            await get().loadCategory(item.category);
            return item;
        } catch (e: any) {
            console.error('Unlock failed:', e.message);
            return null;
        }
    },

    randomRune: async () => {
        try {
            const rune = await api.content.randomRune();
            await get().loadCategory('rune');
            return rune;
        } catch (e: any) {
            console.error('Random rune failed:', e.message);
            return null;
        }
    },

    addQuestion: (q: QuestionRecord) => {
        set((state) => ({ questions: [q, ...state.questions] }));
    },
}));
