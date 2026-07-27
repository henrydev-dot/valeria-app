import { Router, Response } from 'express';
import { User } from '../models/User';
import { Reading } from '../models/Reading';
import { FalReading } from '../models/FalReading';
import { DailyTarot } from '../models/DailyTarot';
import { ReadingRequest } from '../models/ReadingRequest';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations, getCurrentMoonPhase } from '../utils/calculations';
import { ZODIAC_DATA, SIGN_DEITY } from '../constants';
import { UserInput } from '../types';
import { revokeAppleToken } from '../utils/appleAuth';
import { coordsForCountry } from '../data/worldCapitals';
import { resolveBirthCoords } from '../data/turkeyGeo';

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
            birthDistrict: user.birthDistrict,
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
            // Eski demo kayıtları URL değil placeholder metin içeriyordu — sadece
            // gerçek yol ('/api/...') olanları döndür ki istemci kırık resim göstermesin.
            avatarUrl: user.avatarUrl && user.avatarUrl.startsWith('/') ? user.avatarUrl : null,
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

        const allowedFields = ['name', 'gender', 'birthDate', 'birthTime', 'birthCity', 'birthDistrict', 'birthCountry', 'relationshipStatus', 'workStatus'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                (user as any)[field] = req.body[field];
            }
        }

        // Şehir/ilçe değişirse koordinatları güncelle (ilçe > il hassasiyeti)
        if (req.body.birthCity || req.body.birthDistrict) {
            const resolved = resolveBirthCoords(user.birthCity, user.birthDistrict);
            if (resolved) {
                user.latitude = resolved.lat.toString();
                user.longitude = resolved.lon.toString();
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
            birthDistrict: user.birthDistrict,
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

        const { name, gender, birthDate, birthTime, birthCity, birthDistrict, birthCountry, relationshipStatus, workStatus } = req.body;

        if (!name || !gender || !birthDate || !birthTime || !birthCity || !birthCountry || !relationshipStatus || !workStatus) {
            return res.status(400).json({ error: 'Tüm alanlar zorunludur', code: 'MISSING_FIELDS' });
        }

        // Koordinat çözümü: il+ilçe (Türkçe-normalize) → ülke başkenti → İstanbul.
        const resolved = resolveBirthCoords(birthCity, birthDistrict);
        const countryCoords = resolved ? null : coordsForCountry(birthCountry);
        const latitude = resolved ? resolved.lat.toString() : (countryCoords ? countryCoords.lat.toString() : '41.0082');
        const longitude = resolved ? resolved.lon.toString() : (countryCoords ? countryCoords.lon.toString() : '28.9784');

        // Kullanıcı bilgilerini güncelle
        user.name = name;
        user.gender = gender;
        user.birthDate = birthDate;
        user.birthTime = birthTime;
        user.birthCity = birthCity;
        user.birthDistrict = birthDistrict || '';
        user.birthCountry = birthCountry;
        user.latitude = latitude;
        user.longitude = longitude;
        user.relationshipStatus = relationshipStatus;
        user.workStatus = workStatus;

        // Mevcut hesaplama sistemi ile astrolojik verileri hesapla
        const inputData: UserInput = {
            name, birthDate, birthTime, birthCity,
            birthDistrict, birthCountry,
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
        // Enerji skoru: rastgele değil, haritadan türetilir — majör olumlu açı
        // (Trine/Sextile) sayısı arttırır, sert açılar (Square/Opposition) azaltır.
        const aspects = calcData.astrology.aspects || [];
        const soft = aspects.filter(a => a.type === 'Trine' || a.type === 'Sextile').length;
        const hard = aspects.filter(a => a.type === 'Square' || a.type === 'Opposition').length;
        user.energyScore = Math.max(45, Math.min(98, 70 + soft * 3 - hard * 2));

        // Tanrı arketipi: güneş burcuna birebir eşlenmiş, içerik paketinde
        // gerçekten var olan 12 tanrıdan biri (SIGN_DEITY — constants.ts).
        const deity = SIGN_DEITY[calcData.astrology.sun.sign] || SIGN_DEITY['Virgo'];
        user.deityResult = deity.id;
        user.deityName = deity.name;

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

// POST /profile/avatar 🔐 — resmi base64 olarak MongoDB'de kalıcı saklar.
// İstek gövdesi: { imageBase64: string, mime?: 'image/jpeg' | 'image/png' | 'image/webp' }
const AVATAR_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const AVATAR_MAX_BASE64 = 8_000_000; // ~6MB görüntü — Mongo 16MB belge sınırının güvenli altında

router.post('/avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        let { imageBase64, mime } = req.body as { imageBase64?: string; mime?: string };
        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return res.status(400).json({ error: 'Görüntü verisi eksik', code: 'MISSING_IMAGE' });
        }

        // "data:image/jpeg;base64,...." biçiminde geldiyse ayrıştır
        const dataUriMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
        if (dataUriMatch) {
            mime = mime || dataUriMatch[1].toLowerCase();
            imageBase64 = dataUriMatch[2];
        }
        mime = (mime || 'image/jpeg').toLowerCase();
        if (mime === 'image/jpg') mime = 'image/jpeg';

        if (!AVATAR_MIMES.has(mime)) {
            return res.status(400).json({ error: 'Desteklenmeyen görüntü türü', code: 'BAD_MIME' });
        }
        if (imageBase64.length > AVATAR_MAX_BASE64) {
            return res.status(413).json({ error: 'Görüntü çok büyük (en fazla ~6MB)', code: 'IMAGE_TOO_LARGE' });
        }
        // Geçerli base64 mi? (bozuk veri saklamayalım)
        if (!/^[A-Za-z0-9+/=\s]+$/.test(imageBase64)) {
            return res.status(400).json({ error: 'Geçersiz görüntü verisi', code: 'BAD_IMAGE' });
        }

        user.avatarData = imageBase64.replace(/\s/g, '');
        user.avatarMime = mime;
        // v parametresi istemci tarafında önbellek kırmak için (yeni yüklemede URL değişir)
        user.avatarUrl = `/api/profile/avatar/${user._id}?v=${Date.now()}`;
        await user.save();

        return res.json({ avatarUrl: user.avatarUrl, success: true });
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// GET /profile/avatar/:userId — avatar görüntüsünü servis eder (auth'suz;
// URL tahmin edilemez ObjectId içerir, RN <Image> bileşeni header gönderemez).
router.get('/avatar/:userId', async (req, res: Response) => {
    try {
        const user = await User.findById(req.params.userId).select('+avatarData avatarMime');
        if (!user || !user.avatarData) {
            return res.status(404).json({ error: 'Avatar bulunamadı', code: 'NOT_FOUND' });
        }
        const buf = Buffer.from(user.avatarData, 'base64');
        res.setHeader('Content-Type', user.avatarMime || 'image/jpeg');
        res.setHeader('Content-Length', buf.length);
        // URL her yüklemede değiştiği (?v=) için agresif önbellek güvenli
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.end(buf);
    } catch {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// DELETE /profile 🔐 — permanent account + data deletion (App Store 5.1.1(v))
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // If the account used Sign in with Apple, revoke Apple tokens (best-effort;
        // no-op unless Apple keys + stored refresh token are configured).
        if (user.appleId) {
            await revokeAppleToken((user as any).appleRefreshToken);
        }

        // Remove all user-associated data.
        await Promise.all([
            Reading.deleteMany({ userId }),
            FalReading.deleteMany({ userId }),
            DailyTarot.deleteMany({ userId }),
            ReadingRequest.deleteMany({ userId }),
        ]);
        await User.findByIdAndDelete(userId);

        return res.json({ success: true, message: 'Hesabınız ve tüm verileriniz kalıcı olarak silindi.' });
    } catch (error: any) {
        console.error('Account deletion error:', error);
        return res.status(500).json({ error: 'Hesap silme hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
