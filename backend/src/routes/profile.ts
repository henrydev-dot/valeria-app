import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations, getCurrentMoonPhase } from '../utils/calculations';
import { ZODIAC_DATA, TURKISH_CITIES } from '../constants';
import { UserInput } from '../types';

const router = Router();

// GET /profile 🔐
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthCity: user.birthCity,
            birthCountry: user.birthCountry,
            relationshipStatus: user.relationshipStatus,
            workStatus: user.workStatus,
            deityResult: user.deityResult,
            deityName: user.deityName,
            sunSign: user.sunSign,
            moonSign: user.moonSign,
            risingSign: user.risingSign,
            element: user.element,
            energyScore: user.energyScore,
            onboardingComplete: user.onboardingComplete,
            membershipType: user.membershipType,
            avatarUrl: user.avatarUrl || null,
            numerologyAI: user.numerologyAI || null,
            currentMoon: getCurrentMoonPhase()
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// PUT /profile 🔐
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const allowedFields = ['name', 'gender', 'birthDate', 'birthTime', 'birthCity', 'birthCountry', 'relationshipStatus', 'workStatus'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                (user as any)[field] = req.body[field];
            }
        }

        // Şehir değişirse koordinatları güncelle
        if (req.body.birthCity) {
            const cityData = TURKISH_CITIES.find(c => c.name === req.body.birthCity);
            if (cityData) {
                user.latitude = cityData.lat.toString();
                user.longitude = cityData.lon.toString();
            }
        }

        await user.save();

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthCity: user.birthCity,
            birthCountry: user.birthCountry,
            relationshipStatus: user.relationshipStatus,
            workStatus: user.workStatus,
            sunSign: user.sunSign,
            moonSign: user.moonSign,
            risingSign: user.risingSign,
            element: user.element,
            energyScore: user.energyScore,
            onboardingComplete: user.onboardingComplete,
            membershipType: user.membershipType,
            currentMoon: getCurrentMoonPhase()
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Güncelleme hatası', code: 'SERVER_ERROR' });
    }
});

// POST /profile/onboarding 🔐
router.post('/onboarding', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const { name, gender, birthDate, birthTime, birthCity, birthCountry, relationshipStatus, workStatus } = req.body;

        if (!name || !gender || !birthDate || !birthTime || !birthCity || !birthCountry || !relationshipStatus || !workStatus) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur', code: 'MISSING_FIELDS' });
        }

        // Şehir koordinatlarını bul
        const cityData = TURKISH_CITIES.find(c => c.name === birthCity);
        const latitude = cityData ? cityData.lat.toString() : '41.0082';
        const longitude = cityData ? cityData.lon.toString() : '28.9784';

        // Kullanıcı bilgilerini güncelle
        user.name = name;
        user.gender = gender;
        user.birthDate = birthDate;
        user.birthTime = birthTime;
        user.birthCity = birthCity;
        user.birthCountry = birthCountry;
        user.latitude = latitude;
        user.longitude = longitude;
        user.relationshipStatus = relationshipStatus;
        user.workStatus = workStatus;

        // Mevcut hesaplama sistemi ile astrolojik verileri hesapla
        const inputData: UserInput = {
            name, birthDate, birthTime, birthCity,
            latitude, longitude, gender,
            relationshipStatus, jobStatus: workStatus
        };

        const calcData = performCalculations(inputData);

        // Güneş burcu ismini Türkçeye çevir
        const sunSignData = ZODIAC_DATA[calcData.astrology.sun.sign];
        const moonSignData = ZODIAC_DATA[calcData.astrology.moon.sign];
        const risingSignData = ZODIAC_DATA[calcData.astrology.rising.sign];

        user.sunSign = sunSignData?.name || calcData.astrology.sun.sign;
        user.moonSign = moonSignData?.name || calcData.astrology.moon.sign;
        user.risingSign = risingSignData?.name || calcData.astrology.rising.sign;
        user.element = sunSignData?.element || 'Su';
        user.energyScore = Math.floor(Math.random() * 30) + 60; // 60-90 arası

        // Deity mapping — convert Turkish mythology names to frontend deity IDs
        const DEITY_ID_MAP: Record<string, string> = {
            'ares': 'ares',
            'afrodit': 'aphrodite',
            'hermes': 'hermes',
            'demeter': 'demeter',
            'apollon': 'apollo',
            'athena': 'athena',
            'hera': 'hera',
            'hades': 'hades',
            'zeus': 'zeus',
            'kronos': 'athena',  // no kronos deity in frontend, fallback
            'prometheus': 'poseidon', // no prometheus deity, fallback
            'poseidon': 'poseidon',
            'artemis': 'artemis',
        };
        const rawDeityId = sunSignData?.mythology?.greek?.toLowerCase() || 'athena';
        user.deityResult = DEITY_ID_MAP[rawDeityId] || rawDeityId;
        user.deityName = sunSignData?.mythology?.greek || 'Athena';

        user.onboardingComplete = true;
        await user.save();

        return res.json({
            sunSign: user.sunSign,
            moonSign: user.moonSign,
            risingSign: user.risingSign,
            element: user.element,
            deityResult: user.deityResult,
            deityName: user.deityName,
            energyScore: user.energyScore,
            onboardingComplete: true,
            currentMoon: getCurrentMoonPhase()
        });
    } catch (error: any) {
        console.error('Onboarding error:', error);
        return res.status(500).json({ error: 'Onboarding hatası: ' + error.message, code: 'SERVER_ERROR' });
    }
});

// PUT /profile/push-token 🔐
router.put('/push-token', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token zorunludur', code: 'MISSING_FIELDS' });

        await User.findByIdAndUpdate(req.user!._id, { pushToken: token });
        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /profile/avatar 🔐 (demo — stores placeholder; real app would use S3/cloudinary)
router.post('/avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Demo: just mark that an avatar was uploaded
        user.avatarUrl = `avatar_${user._id}_${Date.now()}`;
        await user.save();

        return res.json({ avatarUrl: user.avatarUrl, success: true });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
