/**
 * Seeds (or refreshes) the App Store REVIEW demo account.
 *
 * Creates a user with completed onboarding + plenty of credits + premium so the
 * Apple reviewer can log in and test every feature immediately.
 *
 * Run against the SAME database your production API uses:
 *   MONGODB_URI="..." npx ts-node src/scripts/seedDemoUser.ts
 *   (or: npm run seed:demo)
 *
 * Safe to re-run — it upserts by email.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { performCalculations } from '../utils/calculations';
import { ZODIAC_DATA, TURKISH_CITIES, SIGN_DEITY } from '../constants';
import { coordsForCountry } from '../data/worldCapitals';
import { UserInput } from '../types';

// ── Demo credentials (must match App Store Connect → App Review Information) ──
const DEMO = {
    email: 'demo@valeria.today',
    password: '13791379',
    name: 'Deniz Yıldız',
    gender: 'kadin',
    birthDate: '1995-06-15',
    birthTime: '10:30',
    birthCity: 'İstanbul',
    birthCountry: 'Türkiye',
    relationshipStatus: 'bekar',
    workStatus: 'calisan',
};

async function seedDemo() {
    const MONGODB_URI = process.env.MONGODB_URI || '';
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI tanımlı değil. Örn: MONGODB_URI="..." npm run seed:demo');
        process.exit(1);
    }

    console.log('🔌 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Bağlandı');

    // Coordinates: TR city table → country capital → Istanbul.
    const cityData = TURKISH_CITIES.find((c) => c.name === DEMO.birthCity);
    const countryCoords = coordsForCountry(DEMO.birthCountry);
    const latitude = cityData ? cityData.lat.toString() : countryCoords ? countryCoords.lat.toString() : '41.0082';
    const longitude = cityData ? cityData.lon.toString() : countryCoords ? countryCoords.lon.toString() : '28.9784';

    // Compute the astrology exactly like /profile/onboarding does.
    const inputData: UserInput = {
        name: DEMO.name,
        birthDate: DEMO.birthDate,
        birthTime: DEMO.birthTime,
        birthCity: DEMO.birthCity,
        latitude,
        longitude,
        gender: DEMO.gender,
        relationshipStatus: DEMO.relationshipStatus,
        jobStatus: DEMO.workStatus,
    };
    const calc = performCalculations(inputData);
    const sunData = ZODIAC_DATA[calc.astrology.sun.sign];
    const moonData = ZODIAC_DATA[calc.astrology.moon.sign];
    const risingData = ZODIAC_DATA[calc.astrology.rising.sign];
    const demoDeity = SIGN_DEITY[calc.astrology.sun.sign] || SIGN_DEITY['Virgo'];

    const hashedPassword = await bcrypt.hash(DEMO.password, 10);

    const fields = {
        email: DEMO.email,
        password: hashedPassword,
        name: DEMO.name,
        gender: DEMO.gender,
        birthDate: DEMO.birthDate,
        birthTime: DEMO.birthTime,
        birthCity: DEMO.birthCity,
        birthCountry: DEMO.birthCountry,
        latitude,
        longitude,
        relationshipStatus: DEMO.relationshipStatus,
        workStatus: DEMO.workStatus,
        sunSign: sunData?.name || calc.astrology.sun.sign,
        moonSign: moonData?.name || calc.astrology.moon.sign,
        risingSign: risingData?.name || calc.astrology.rising.sign,
        element: sunData?.element || 'Su',
        energyScore: 82,
        deityResult: demoDeity.id,
        deityName: demoDeity.name,
        onboardingComplete: true,
        // Generous entitlements so the reviewer can test everything without limits.
        membershipType: 'premium',
        credits: 99999,
        xp: 500,
        level: 6,
        streakDays: 7,
        dailyQuestionsRemaining: 10,
        freeQuestionUsed: false,
    };

    const user = await User.findOneAndUpdate(
        { email: DEMO.email },
        { $set: fields },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Demo hesabı hazır:');
    console.log(`   E-posta : ${DEMO.email}`);
    console.log(`   Şifre   : ${DEMO.password}`);
    console.log(`   Burç    : ${user?.sunSign} / ${user?.moonSign} / ${user?.risingSign}`);
    console.log(`   Arketip : ${user?.deityName} (${user?.deityResult})`);
    console.log(`   Kredi   : ${user?.credits} · Üyelik: ${user?.membershipType}`);

    await mongoose.disconnect();
    console.log('👋 Bağlantı kapatıldı');
    process.exit(0);
}

seedDemo().catch((e) => {
    console.error('❌ Demo seed hatası:', e);
    process.exit(1);
});
