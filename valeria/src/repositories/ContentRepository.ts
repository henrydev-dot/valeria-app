import { TarotCard, Advisor, LearningCard, ZodiacSign } from '../types';
import tarotData from '../../content/tarot_major_arcana_tr.json';
import advisorsData from '../../content/advisors_tr.json';
import learningCardsData from '../../content/discover_learning_cards_tr.json';
import zodiacData from '../../content/zodiac_tr.json';
import homeTemplatesData from '../../content/home_content_templates_tr.json';

// Content repository — reads from local JSON (can be swapped to Firestore)
export class ContentRepository {
    // Toggle for data source
    private static useFirebase = false;

    static setUseFirebase(value: boolean) {
        this.useFirebase = value;
    }

    static async getTarotCards(): Promise<TarotCard[]> {
        if (this.useFirebase) {
            // TODO: Fetch from Firestore
            // return await firestore().collection('tarotCards').get()...
        }
        return tarotData as TarotCard[];
    }

    static async getAdvisors(): Promise<Advisor[]> {
        if (this.useFirebase) {
            // TODO: Fetch from Firestore
        }
        return advisorsData as Advisor[];
    }

    static async getLearningCards(): Promise<LearningCard[]> {
        if (this.useFirebase) {
            // TODO: Fetch from Firestore
        }
        return learningCardsData as LearningCard[];
    }

    static async getZodiacSigns(): Promise<ZodiacSign[]> {
        if (this.useFirebase) {
            // TODO: Fetch from Firestore
        }
        return zodiacData as ZodiacSign[];
    }

    static async getHomeTemplates(): Promise<any> {
        if (this.useFirebase) {
            // TODO: Fetch from Firestore
        }
        return homeTemplatesData;
    }

    static async getOnboardingTest(): Promise<any> {
        const data = require('../../content/onboarding_test_tr.json');
        return data;
    }
}
