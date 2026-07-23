import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function clearUsers() {
    try {
        console.log('🔌 MongoDB bağlantısı kuruluyor...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı');

        console.log('🗑️ Kullanıcılar siliniyor...');
        const result = await User.deleteMany({});
        console.log(`✅ ${result.deletedCount} kullanıcı silindi.`);

        console.log('🎉 İşlem tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

clearUsers();
