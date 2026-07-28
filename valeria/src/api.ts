import AsyncStorage from '@react-native-async-storage/async-storage';

// Uses EXPO_PUBLIC_API_URL from .env, fallback to localhost:3000
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const API_HOST = API_BASE.replace(/\/api$/, '');
console.log('🔗 API_BASE:', API_BASE);

const TOKEN_KEY = '@valeria_access_token';
const REFRESH_KEY = '@valeria_refresh_token';

// Token management
export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.multiSet([[TOKEN_KEY, access], [REFRESH_KEY, refresh]]);
}

export async function clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

async function refreshAccessToken(): Promise<string | null> {
    const refresh = await AsyncStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        await setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch {
        return null;
    }
}

// Core fetch wrapper with auto-auth
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    let token = await getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        }
        // Still unauthorized (expired/invalid session, e.g. the user no longer
        // exists) → drop the stale tokens so the app returns to a clean logged-out
        // state instead of throwing on every launch.
        if (res.status === 401) {
            await clearTokens();
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }));
        const error = new Error(err.error || `HTTP ${res.status}`) as Error & { status?: number; code?: string };
        error.status = res.status;
        error.code = err.code;
        throw error;
    }

    return res.json();
}

// ─── AUTH ──────────────────────────────────────────
export const auth = {
    register: (email: string, password: string, name: string) =>
        apiFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    login: (email: string, password: string) =>
        apiFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    apple: (appleId: string, email?: string, name?: string, identityToken?: string) =>
        apiFetch<{ accessToken: string; refreshToken: string; user: any }>('/auth/apple', {
            method: 'POST',
            body: JSON.stringify({ appleId, email, name, identityToken }),
        }),
};

// ─── PROFILE ──────────────────────────────────────
export const profile = {
    get: () => apiFetch<any>('/profile'),

    update: (data: Record<string, any>) =>
        apiFetch<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

    onboarding: (data: Record<string, any>) =>
        apiFetch<any>('/profile/onboarding', { method: 'POST', body: JSON.stringify(data) }),

    // Avatar sunucuda (MongoDB) kalıcı saklanır; dönen avatarUrl'i
    // API_HOST ile birleştirip <Image>'e ver.
    uploadAvatar: (imageBase64: string, mime = 'image/jpeg') =>
        apiFetch<{ avatarUrl: string; success: boolean }>('/profile/avatar', {
            method: 'POST',
            body: JSON.stringify({ imageBase64, mime }),
        }),

    // Permanent account + data deletion (App Store 5.1.1(v)).
    deleteAccount: () => apiFetch<any>('/profile', { method: 'DELETE' }),
};

// ─── ENTITLEMENTS ─────────────────────────────────
export const entitlements = {
    get: () => apiFetch<any>('/entitlements'),

    spend: (amount: number, reason: string, contentId?: string) =>
        apiFetch<any>('/entitlements/spend', {
            method: 'POST',
            body: JSON.stringify({ amount, reason, contentId }),
        }),

    earn: (xp: number) =>
        apiFetch<any>('/entitlements/earn', { method: 'POST', body: JSON.stringify({ xp }) }),

    adWatch: () =>
        apiFetch<any>('/entitlements/ad-watch', { method: 'POST' }),

    addCredits: (amount: number, packageName: string) =>
        apiFetch<any>('/entitlements/add-credits', {
            method: 'POST',
            body: JSON.stringify({ amount, packageName }),
        }),

    // Gerçek Apple IAP: makbuz sunucuda doğrulanır, krediyi sunucu belirler.
    verifyPurchase: (receiptData: string, productId: string, transactionId?: string) =>
        apiFetch<any>('/entitlements/verify-purchase', {
            method: 'POST',
            body: JSON.stringify({ receiptData, productId, transactionId }),
        }),

    packages: () => apiFetch<any[]>('/entitlements/packages'),
};

// ─── CONTENT ──────────────────────────────────────
export const content = {
    list: (category?: string) =>
        apiFetch<any[]>(`/content${category ? `?category=${category}` : ''}`),

    unlock: (contentId: string) =>
        apiFetch<any>(`/content/${contentId}/unlock`, { method: 'POST' }),

    randomRune: () =>
        apiFetch<any>('/content/runes/random', { method: 'POST' }),
};

// ─── READINGS ─────────────────────────────────────
export const readings = {
    tarot: (question?: string) =>
        apiFetch<any>('/readings/tarot', {
            method: 'POST',
            body: JSON.stringify({ question }),
        }),

    coffee: (question?: string, images?: string[]) =>
        apiFetch<any>('/readings/coffee', {
            method: 'POST',
            body: JSON.stringify({ question, images }),
        }),

    question: (question: string) =>
        apiFetch<any>('/readings/question', {
            method: 'POST',
            body: JSON.stringify({ question }),
        }),

    history: () => apiFetch<any[]>('/readings/history'),

    tarotAI: (data: { cardName: string; isReversed: boolean; sunSign: string }) =>
        apiFetch<any>('/readings/tarot-ai', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    advisorRequest: (advisorId: string, type: string, question: string, images?: string[]) =>
        apiFetch<any>('/readings/advisor-request', {
            method: 'POST',
            body: JSON.stringify({ advisorId, type, question, images }),
        }),

    advisorRequests: () =>
        apiFetch<any[]>('/readings/advisor-requests'),

    advisorRequestDetail: (id: string) =>
        apiFetch<any>(`/readings/advisor-requests/${id}`),

    // Kahve fincanı fotoğrafları (büyük base64 — sohbet açıldıktan sonra tembel yüklenir)
    advisorRequestImages: (id: string) =>
        apiFetch<{ images: string[] }>(`/readings/advisor-requests/${id}/images`),

    // Fala özel ek soru (10 kredi) — cevap sohbete düşer
    advisorFollowUp: (id: string, question: string) =>
        apiFetch<any>(`/readings/advisor-requests/${id}/follow-up`, {
            method: 'POST',
            body: JSON.stringify({ question }),
        }),

    numerologyAI: (data: { lifePath: number; expression: number; soulUrge: number; personality: number }) =>
        apiFetch<any>('/readings/numerology-ai', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ─── ADVISORS ─────────────────────────────────────
export const advisors = {
    list: () => apiFetch<any[]>('/advisors'),

    request: (advisorId: string, question: string) =>
        apiFetch<any>('/advisors/request', {
            method: 'POST',
            body: JSON.stringify({ advisorId, question }),
        }),
};

// ─── ASTROLOGY ────────────────────────────────────
export const astrology = {
    daily: () => apiFetch<any>('/astrology/daily'),
    weekly: () => apiFetch<any>('/astrology/weekly'),
    natalChart: () => apiFetch<any>('/astrology/natal-chart'),
    compatibility: (signId1: number, signId2: number) =>
        apiFetch<any>('/astrology/compatibility', {
            method: 'POST',
            body: JSON.stringify({ signId1, signId2 }),
        }),
    transits: () => apiFetch<any>('/transits'),
    fullAnalysis: () => apiFetch<any>('/astrology/full-analysis'),
    retroCalendar: () => apiFetch<any>('/astrology/retro-calendar'),
    houseInsight: (house: number, question?: string) =>
        apiFetch<any>('/astrology/house-insight', {
            method: 'POST',
            body: JSON.stringify({ house, question }),
        }),
};

// ─── DAILY TAROT ──────────────────────────────────
export const dailyTarot = {
    get: () => apiFetch<any>('/daily-tarot'),
};

// ─── SUBSCRIPTIONS ────────────────────────────────
export const subscriptions = {
    plans: () => apiFetch<any[]>('/subscriptions/plans'),
    purchase: (planId: string, receipt?: string, platform?: string) =>
        apiFetch<any>('/subscriptions/purchase', {
            method: 'POST',
            body: JSON.stringify({ planId, receipt, platform }),
        }),
    status: () => apiFetch<any>('/subscriptions/status'),
};

// ─── PUSH ─────────────────────────────────────────
export const push = {
    saveToken: (token: string) =>
        apiFetch<any>('/profile/push-token', {
            method: 'PUT',
            body: JSON.stringify({ token }),
        }),
};
