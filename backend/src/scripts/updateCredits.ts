import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';

async function updateCredits() {
    const MONGODB_URI = process.env.MONGODB_URI || '';
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI tanımlı değil.');
        process.exit(1);
    }

    console.log('🔌 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Bağlandı');

    const result = await User.updateMany(
        {},
        { $set: { credits: 999 } }
    );

    console.log(`✅ ${result.modifiedCount} kullanıcının bakiyesi 999 kredi olarak güncellendi.`);

    await mongoose.disconnect();
    console.log('👋 Bağlantı kapatıldı.');
    process.exit(0);
}

updateCredits().catch((err) => {
    console.error('❌ Güncelleme hatası:', err);
    process.exit(1);
});
