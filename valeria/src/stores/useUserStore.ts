import { create } from 'zustand';
import * as api from '../api';
import { UserRepository } from '../repositories/UserRepository';

interface UserProfile {
    _id?: string;
    name: string;
    email?: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    birthCity: string;
    birthDistrict: string;
    birthCountry: string;
    relationshipStatus: string;
    workStatus: string;
    deityResult: string;
    deityName: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    element?: string;
    energyScore: number;
    onboardingComplete: boolean;
    membershipType?: string;
    currentMoon?: { phase: string; image: string; illumination: number };
}

interface UserState {
    profile: UserProfile;
    isLoading: boolean;
    isAuthenticated: boolean;
    setProfile: (profile: Partial<UserProfile>) => void;
    loadProfile: () => Promise<void>;
    saveProfile: () => Promise<void>;
    login: (email: string, password: string) => Promise<{ onboardingComplete: boolean }>;
    appleLogin: (appleId: string, email?: string, name?: string, identityToken?: string) => Promise<{ onboardingComplete: boolean }>;
    register: (email: string, password: string, name: string) => Promise<void>;
    onboarding: (data: Record<string, any>) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    resetProfile: () => void;
}

const defaultProfile: UserProfile = {
    name: '', gender: '', birthDate: '', birthTime: '',
    birthCity: '', birthDistrict: '', birthCountry: '', relationshipStatus: '',
    workStatus: '', deityResult: '', deityName: '',
    sunSign: '', moonSign: '', risingSign: '',
    energyScore: 0, onboardingComplete: false,
};

export const useUserStore = create<UserState>((set, get) => ({
    profile: { ...defaultProfile },
    isLoading: true,
    isAuthenticated: false,

    setProfile: (partial) => {
        set((state) => ({ profile: { ...state.profile, ...partial } }));
    },

    loadProfile: async () => {
        try {
            set({ isLoading: true });
            const token = await api.getToken();
            if (!token) {
                // No token — try loading from local cache
                const saved = await UserRepository.getProfile();
                if (saved) set({ profile: saved as any, isLoading: false });
                else set({ isLoading: false });
                return;
            }
            // Fetch from API
            const user = await api.profile.get();
            const p: UserProfile = {
                _id: user._id,
                name: user.name || '',
                email: user.email,
                gender: user.gender || '',
                birthDate: user.birthDate || '',
                birthTime: user.birthTime || '',
                birthCity: user.birthCity || '',
                birthDistrict: user.birthDistrict || '',
                birthCountry: user.birthCountry || '',
                relationshipStatus: user.relationshipStatus || '',
                workStatus: user.workStatus || '',
                deityResult: user.deityResult || '',
                deityName: user.deityName || '',
                sunSign: user.sunSign || '',
                moonSign: user.moonSign || '',
                risingSign: user.risingSign || '',
                element: user.element || '',
                energyScore: user.energyScore || 0,
                onboardingComplete: user.onboardingComplete || false,
                membershipType: user.membershipType,
                currentMoon: user.currentMoon,
            };
            set({ profile: p, isAuthenticated: true, isLoading: false });
            await UserRepository.saveProfile(p as any);
        } catch (e: any) {
            // A valid-looking token whose session is invalid (user deleted / DB
            // reset): server answers 401 or 404. Drop the stale session and go to
            // a clean logged-out state instead of resurrecting a dead cache.
            if (e?.status === 401 || e?.status === 404) {
                await api.clearTokens();
                await UserRepository.clearAll();
                set({ profile: { ...defaultProfile }, isAuthenticated: false, isLoading: false });
                return;
            }
            // Otherwise assume it's a transient/offline error → use local cache.
            console.warn('Profil yüklenemedi (çevrimdışı olabilir):', e?.message);
            const saved = await UserRepository.getProfile();
            if (saved) set({ profile: saved as any, isLoading: false });
            else set({ isLoading: false });
        }
    },

    saveProfile: async () => {
        try {
            await UserRepository.saveProfile(get().profile as any);
        } catch (e) {
            console.error('Failed to save profile:', e);
        }
    },

    login: async (email, password) => {
        const res = await api.auth.login(email, password);
        await api.setTokens(res.accessToken, res.refreshToken);
        set({ isAuthenticated: true });
        // Load full profile from server
        await get().loadProfile();
        return { onboardingComplete: res.user.onboardingComplete || false };
    },

    appleLogin: async (appleId, email, name, identityToken) => {
        const res = await api.auth.apple(appleId, email || undefined, name || undefined, identityToken);
        await api.setTokens(res.accessToken, res.refreshToken);
        set({ isAuthenticated: true });
        await get().loadProfile();
        return { onboardingComplete: res.user.onboardingComplete || false };
    },

    register: async (email, password, name) => {
        const res = await api.auth.register(email, password, name);
        await api.setTokens(res.accessToken, res.refreshToken);
        set({ isAuthenticated: true });
        get().setProfile({ name, email });
    },

    onboarding: async (data) => {
        const user = await api.profile.onboarding(data);
        const p: UserProfile = {
            ...get().profile,
            ...data,
            sunSign: user.sunSign || '',
            moonSign: user.moonSign || '',
            risingSign: user.risingSign || '',
            deityResult: user.deityResult || '',
            deityName: user.deityName || '',
            element: user.element || '',
            energyScore: user.energyScore || 0,
            onboardingComplete: true,
            currentMoon: user.currentMoon,
        };
        set({ profile: p });
        await UserRepository.saveProfile(p as any);
    },

    logout: async () => {
        await api.clearTokens();
        await UserRepository.clearAll();
        set({ profile: { ...defaultProfile }, isAuthenticated: false });
    },

    deleteAccount: async () => {
        // Delete server-side account + data, then clear all local state.
        await api.profile.deleteAccount();
        await api.clearTokens();
        await UserRepository.clearAll();
        set({ profile: { ...defaultProfile }, isAuthenticated: false });
    },

    resetProfile: () => {
        set({ profile: { ...defaultProfile }, isAuthenticated: false });
        UserRepository.clearProfile();
    },
}));
