import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Entitlements, TarotReading, DailyQuestion, CoffeeReading, PurchaseLog } from '../types';

const KEYS = {
    PROFILE: '@kismet_profile',
    ENTITLEMENTS: '@kismet_entitlements',
    READING_HISTORY: '@kismet_reading_history',
    COFFEE_HISTORY: '@kismet_coffee_history',
    QUESTION_HISTORY: '@kismet_question_history',
    PURCHASE_LOG: '@kismet_purchase_log',
    SETTINGS: '@kismet_settings',
};

export class UserRepository {
    // Profile
    static async saveProfile(profile: UserProfile): Promise<void> {
        await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    }

    static async getProfile(): Promise<UserProfile | null> {
        const data = await AsyncStorage.getItem(KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    }

    static async clearProfile(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.PROFILE);
    }

    // Entitlements
    static async saveEntitlements(entitlements: Entitlements): Promise<void> {
        await AsyncStorage.setItem(KEYS.ENTITLEMENTS, JSON.stringify(entitlements));
    }

    static async getEntitlements(): Promise<Entitlements | null> {
        const data = await AsyncStorage.getItem(KEYS.ENTITLEMENTS);
        return data ? JSON.parse(data) : null;
    }

    static async clearEntitlements(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.ENTITLEMENTS);
    }

    // Reading History
    static async saveReadingHistory(readings: TarotReading[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(readings));
    }

    static async getReadingHistory(): Promise<TarotReading[] | null> {
        const data = await AsyncStorage.getItem(KEYS.READING_HISTORY);
        return data ? JSON.parse(data) : null;
    }

    // Coffee Reading History
    static async saveCoffeeHistory(readings: CoffeeReading[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.COFFEE_HISTORY, JSON.stringify(readings));
    }

    static async getCoffeeHistory(): Promise<CoffeeReading[] | null> {
        const data = await AsyncStorage.getItem(KEYS.COFFEE_HISTORY);
        return data ? JSON.parse(data) : null;
    }

    // Daily Question History
    static async saveQuestionHistory(questions: DailyQuestion[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.QUESTION_HISTORY, JSON.stringify(questions));
    }

    static async getQuestionHistory(): Promise<DailyQuestion[] | null> {
        const data = await AsyncStorage.getItem(KEYS.QUESTION_HISTORY);
        return data ? JSON.parse(data) : null;
    }

    // Purchase Log
    static async savePurchaseLog(log: PurchaseLog[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.PURCHASE_LOG, JSON.stringify(log));
    }

    static async getPurchaseLog(): Promise<PurchaseLog[] | null> {
        const data = await AsyncStorage.getItem(KEYS.PURCHASE_LOG);
        return data ? JSON.parse(data) : null;
    }

    // Clear all history
    static async clearHistory(): Promise<void> {
        await AsyncStorage.multiRemove([
            KEYS.READING_HISTORY,
            KEYS.COFFEE_HISTORY,
            KEYS.QUESTION_HISTORY,
        ]);
    }

    // Clear everything
    static async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove(Object.values(KEYS));
    }

    // Settings
    static async saveSetting(key: string, value: any): Promise<void> {
        const settings = await this.getSettings();
        settings[key] = value;
        await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }

    static async getSettings(): Promise<Record<string, any>> {
        const data = await AsyncStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : {};
    }
}
