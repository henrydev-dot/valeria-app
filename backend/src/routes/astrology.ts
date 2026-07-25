import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations } from '../utils/calculations';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateCompatibility, generateInterpretation } from '../services/geminiService';
import { ZODIAC_DATA, TURKISH_CITIES, HOUSE_MEANINGS } from '../constants';
import { ZODIAC_SIGNS } from '../data/seedData';
import { UserInput } from '../types';

const router = Router();

// GET /astrology/daily 🔐
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const sign = user.sunSign || 'Koç';
        const today = new Date().toISOString().split('T')[0];

        const horoscope = await generateDailyHoroscope(sign);

        return res.json({
            sign,
            date: today,
            ...horoscope
        });
    } catch (error: any) {
        console.error('Daily horoscope error:', error);
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// GET /astrology/weekly 🔐
router.get('/weekly', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const sign = user.sunSign || 'Koç';
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 6);

        const horoscope = await generateWeeklyHoroscope(sign);

        return res.json({
            sign,
            weekStart: today.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            ...horoscope
        });
    } catch (error: any) {
        console.error('Weekly horoscope error:', error);
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// GET /astrology/natal-chart 🔐
router.get('/natal-chart', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        if (!user.birthDate || !user.birthTime) {
            return res.status(400).json({ error: 'Doğum bilgileri eksik. Lütfen onboarding tamamlayın.', code: 'MISSING_DATA' });
        }

        // Mevcut hesaplama sistemi ile natal chart hesapla
        const inputData: UserInput = {
            name: user.name,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthCity: user.birthCity || 'İstanbul',
            birthDistrict: user.birthDistrict || undefined,
            birthCountry: user.birthCountry || 'Türkiye',
            latitude: user.latitude || '41.0082',
            longitude: user.longitude || '28.9784',
            gender: user.gender,
            relationshipStatus: user.relationshipStatus,
            jobStatus: user.workStatus
        };

        const calcData = performCalculations(inputData);

        // req.md formatında çıktı
        const sunData = ZODIAC_DATA[calcData.astrology.sun.sign];
        const moonData = ZODIAC_DATA[calcData.astrology.moon.sign];
        const risingData = ZODIAC_DATA[calcData.astrology.rising.sign];

        const { getCurrentMoonPhase } = require('../utils/calculations');
        const moonPhaseInfo = getCurrentMoonPhase();

        return res.json({
            sunSign: sunData?.name || calcData.astrology.sun.sign,
            moonSign: moonData?.name || calcData.astrology.moon.sign,
            risingSign: risingData?.name || calcData.astrology.rising.sign,
            element: sunData?.element || 'Su',
            moonPhase: moonPhaseInfo,
            planets: calcData.astrology.planets.map(p => ({
                name: p.planetNameTR,
                sign: ZODIAC_DATA[p.sign]?.name || p.sign,
                house: p.house,
                degree: Math.round(p.degree * 10) / 10
            })),
            houses: calcData.astrology.houses.map(h => ({
                house: h.houseNumber,
                sign: h.sign,
                degree: 0
            })),
            aspects: calcData.astrology.aspects.map(a => ({
                planet1: a.planet1,
                planet2: a.planet2,
                type: a.type,
                degree: a.angle
            }))
        });
    } catch (error: any) {
        console.error('Natal chart error:', error);
        return res.status(500).json({ error: 'Natal chart hatası', code: 'SERVER_ERROR' });
    }
});
// POST /astrology/compatibility 🔐

// GET /astrology/full-analysis 🔐
router.get('/full-analysis', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        if (!user.birthDate || !user.birthTime) {
            return res.status(400).json({ error: 'Doğum bilgileri eksik.', code: 'MISSING_DATA' });
        }

        const inputData: UserInput = {
            name: user.name,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthCity: user.birthCity || 'İstanbul',
            birthDistrict: user.birthDistrict || undefined,
            birthCountry: user.birthCountry || 'Türkiye',
            latitude: user.latitude || '41.0082',
            longitude: user.longitude || '28.9784',
            gender: user.gender,
            relationshipStatus: user.relationshipStatus,
            jobStatus: user.workStatus
        };

        const calcData = performCalculations(inputData);

        // Houses with meanings and planets
        const houses = calcData.astrology.houses.map(h => {
            const planetsInHouse = calcData.astrology.planets
                .filter(p => p.house === h.houseNumber)
                .map(p => ({
                    name: p.planetNameTR,
                    sign: ZODIAC_DATA[p.sign]?.name || p.sign,
                    degree: Math.round(p.degree * 10) / 10,
                    isRetrograde: p.retrograde || false
                }));
            return {
                house: h.houseNumber,
                sign: ZODIAC_DATA[h.sign]?.name || h.sign,
                meaning: HOUSE_MEANINGS[h.houseNumber] || '',
                planets: planetsInHouse
            };
        });

        // Retrograde planets
        const retrogradePlanets = calcData.astrology.planets
            .filter(p => p.retrograde)
            .map(p => ({
                name: p.planetNameTR,
                sign: ZODIAC_DATA[p.sign]?.name || p.sign,
                house: p.house
            }));

        // Love & Relationship analysis from Gemini
        const aiData = await generateInterpretation(
            inputData,
            {
                sun: calcData.astrology.sun,
                moon: calcData.astrology.moon,
                rising: calcData.astrology.rising
            },
            calcData.numerology
        );

        return res.json({
            houses,
            retrogradePlanets,
            loveAnalysis: aiData.relationshipAnalysis,
            personalitySummary: aiData.personalitySummary,
            prediction: aiData.prediction
        });
    } catch (error: any) {
        console.error('Full analysis error:', error);
        return res.status(500).json({ error: 'Analiz hatası', code: 'SERVER_ERROR' });
    }
});

// POST /astrology/compatibility 🔐
router.post('/compatibility', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { signId1, signId2 } = req.body;

        if (!signId1 || !signId2 || signId1 < 1 || signId1 > 12 || signId2 < 1 || signId2 > 12) {
            return res.status(400).json({ error: 'Geçerli signId1 ve signId2 (1-12) gerekli', code: 'MISSING_FIELDS' });
        }

        const sign1 = ZODIAC_SIGNS.find(z => z.id === signId1);
        const sign2 = ZODIAC_SIGNS.find(z => z.id === signId2);

        if (!sign1 || !sign2) {
            return res.status(400).json({ error: 'Burç bulunamadı', code: 'NOT_FOUND' });
        }

        const result = await generateCompatibility(sign1.nameTR, sign2.nameTR);

        return res.json({
            sign1: sign1.nameTR,
            sign2: sign2.nameTR,
            ...result
        });
    } catch (error: any) {
        console.error('Compatibility error:', error);
        return res.status(500).json({ error: 'Uyum analizi hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
