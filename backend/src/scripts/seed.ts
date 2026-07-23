import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Content } from '../models/Content';
import { Advisor } from '../models/Advisor';
import { DEMO_CRYSTALS, DEMO_RUNES, DEMO_RITUALS, DEMO_ADVISORS } from '../data/seedData';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
    try {
        console.log('🔌 MongoDB bağlantısı kuruluyor...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı');

        // Content seed
        console.log('📦 İçerikler yükleniyor...');
        const allContent = [...DEMO_CRYSTALS, ...DEMO_RUNES, ...DEMO_RITUALS];
        for (const item of allContent) {
            await Content.findOneAndUpdate(
                { contentId: item.contentId },
                item,
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${allContent.length} içerik yüklendi`);

        // Advisor seed
        console.log('👤 Danışmanlar yükleniyor...');
        for (const advisor of DEMO_ADVISORS) {
            await Advisor.findOneAndUpdate(
                { advisorId: advisor.advisorId },
                advisor,
                { upsert: true, new: true }
            );
        }
        console.log(`✅ ${DEMO_ADVISORS.length} danışman yüklendi`);

        console.log('🎉 Seed tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed hatası:', error);
        process.exit(1);
    }
}

seed();
