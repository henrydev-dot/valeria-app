import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations } from '../utils/calculations';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateCompatibility, generateInterpretation } from '../services/geminiService';
import { aiGenerate } from '../services/aiClient';
import { buildNatalBlock } from '../services/promptContext';
import { ZODIAC_DATA, TURKISH_CITIES, HOUSE_MEANINGS, RETROGRADE_CALENDAR_2026, NATAL_RETROGRADE_MEANINGS } from '../constants';
import { ZODIAC_SIGNS } from '../data/seedData';
import { UserInput } from '../types';
import * as Astronomy from 'astronomy-engine';

const router = Router();

/** Verilen gövde şu an geriliyor mu (bugün vs dün, geosantrik boylam). */
const isRetroNow = (body: string): boolean => {
    try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 86400000);
        const lon = (d: Date) => Astronomy.Ecliptic(Astronomy.GeoVector(body as Astronomy.Body, Astronomy.MakeTime(d), true)).elon;
        let diff = lon(now) - lon(yesterday);
        if (diff > 300) diff -= 360;
        if (diff < -300) diff += 360;
        return diff < 0;
    } catch { return false; }
};

// GET /astrology/retro-calendar 🔐 — 2026 retro takvimi + şu an retro olanlar
// "Şu an retroda" hesabı 8 gezegen için efemeris taraması gerektiriyor ve her
// istekte yeniden yapılıyordu — sayfanın geç gelmesinin ana sebebi. Retro durumu
// saatler mertebesinde değiştiği için sonuç 6 saat bellekte tutulur.
let retroCache: { data: any; at: number } | null = null;
const RETRO_CACHE_MS = 6 * 60 * 60 * 1000;

router.get('/retro-calendar', authMiddleware, async (_req: AuthRequest, res: Response) => {
    try {
        if (retroCache && Date.now() - retroCache.at < RETRO_CACHE_MS) {
            return res.json(retroCache.data);
        }
        const bodies: Array<{ body: string; name: string }> = [
            { body: 'Mercury', name: 'Merkür' }, { body: 'Venus', name: 'Venüs' },
            { body: 'Mars', name: 'Mars' }, { body: 'Jupiter', name: 'Jüpiter' },
            { body: 'Saturn', name: 'Satürn' }, { body: 'Uranus', name: 'Uranüs' },
            { body: 'Neptune', name: 'Neptün' }, { body: 'Pluto', name: 'Plüton' },
        ];
        const currentlyRetro = bodies.filter(b => isRetroNow(b.body)).map(b => b.name);
        const data = {
            currentlyRetro,
            calendar: RETROGRADE_CALENDAR_2026,
            natalRetroMeanings: NATAL_RETROGRADE_MEANINGS,
        };
        retroCache = { data, at: Date.now() };
        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ error: 'Retro takvimi hatası', code: 'SERVER_ERROR' });
    }
});

// POST /astrology/house-insight 🔐 — bir ev+burç yerleşimi için AI yorumu (10 kredi)
// body: { house: 1-12, question?: string }
const HOUSE_INSIGHT_COST = 10;
router.post('/house-insight', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const house = parseInt(req.body?.house, 10);
        const question = (req.body?.question || '').toString().slice(0, 300);
        if (!house || house < 1 || house > 12) {
            return res.status(400).json({ error: 'Geçerli ev numarası (1-12) gerekli', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });
        if (!user.birthDate || !user.birthTime) {
            return res.status(400).json({ error: 'Doğum bilgileri eksik.', code: 'MISSING_DATA' });
        }
        if (user.credits < HOUSE_INSIGHT_COST) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: HOUSE_INSIGHT_COST, available: user.credits }
            });
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
        const calc = performCalculations(inputData);
        const houseData = calc.astrology.houses.find(h => h.houseNumber === house)!;
        const signTR = ZODIAC_DATA[houseData.sign]?.name || houseData.sign;
        const planetsInHouse = calc.astrology.planets
            .filter(p => p.house === house)
            .map(p => `${p.planetNameTR} ${ZODIAC_DATA[p.sign]?.name || p.sign} ${p.degree.toFixed(0)}°${p.retrograde ? ' (retro)' : ''}`)
            .join(', ');

        const prompt = `
    KİŞİ:
    ${buildNatalBlock(user)}

    İNCELENEN YERLEŞİM: ${house}. ev — ${signTR} burcunda.
    Evin konusu: ${HOUSE_MEANINGS[house]}
    Bu evdeki gezegenler: ${planetsInHouse || 'yok'}
    ${question ? `KİŞİNİN SORUSU: "${question}" — yanıtın merkezine bu soruyu al.` : ''}

    GÖREV: Bu kişiye ${house}. evindeki ${signTR} yerleşiminin ne anlama geldiğini anlat:
    1) Bu ev + bu burç birleşimi hayatında nasıl görünür (2-3 cümle, kişiye özel),
    2) Evdeki gezegenler varsa etkileri (1-2 cümle),
    3) Dikkat etmesi gereken 1-2 nokta ve bu enerjiyi iyi kullanmanın yolu.
    Toplam 5-8 cümle, samimi "Sen" dili, teknik jargonu sadeleştir. Türkçe yaz.`;

        const insight = await aiGenerate(prompt, { tier: 'quality', maxTokens: 1500 });
        if (!insight) throw new Error('Boş yanıt');

        user.credits -= HOUSE_INSIGHT_COST;
        // Yorum kullanıcıya KAYDEDİLİR: ev tekrar açıldığında kredi harcamadan
        // görünür; kullanıcı isterse yeniden yorumlatıp kaydın üzerine yazar.
        const savedAt = new Date();
        user.houseInsights = {
            ...(user.houseInsights || {}),
            [String(house)]: { insight, question: question || undefined, at: savedAt },
        };
        user.markModified('houseInsights');
        await user.save();

        return res.json({
            house,
            sign: signTR,
            meaning: HOUSE_MEANINGS[house],
            planets: planetsInHouse,
            insight,
            savedAt,
            credits: user.credits
        });
    } catch (error: any) {
        console.error('House insight error:', error);
        return res.status(500).json({ error: 'Ev yorumu hatası', code: 'SERVER_ERROR' });
    }
});

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

// ─── Haftalık analiz yardımcıları ──────────────────────────────────
// Kozmik özet + ilişki analizi + haftalık kehanet haftada BİR üretilir ve
// kullanıcıya kaydedilir; her sayfa açılışında yeniden AI çağrılmaz. Kullanıcı
// isterse kredi karşılığı yeniletir (POST /full-analysis/refresh).
const ANALYSIS_REFRESH_COST = 25;

/** Haftanın anahtarı: o haftanın pazartesi tarihi (UTC, YYYY-MM-DD). */
function currentWeekKey(): string {
    const d = new Date();
    const day = (d.getUTCDay() + 6) % 7; // pazartesi=0
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10);
}

function buildUserInput(user: any): UserInput {
    return {
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
}

function buildHousesAndRetros(calcData: any) {
    const houses = calcData.astrology.houses.map((h: any) => {
        const planetsInHouse = calcData.astrology.planets
            .filter((p: any) => p.house === h.houseNumber)
            .map((p: any) => ({
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
    const retrogradePlanets = calcData.astrology.planets
        .filter((p: any) => p.retrograde)
        .map((p: any) => ({
            name: p.planetNameTR,
            sign: ZODIAC_DATA[p.sign]?.name || p.sign,
            house: p.house
        }));
    return { houses, retrogradePlanets };
}

function analysisResponse(user: any, houses: any, retrogradePlanets: any, ai: any, computedAt: Date | null, weekKey: string) {
    return {
        houses,
        retrogradePlanets,
        loveAnalysis: ai?.relationshipAnalysis,
        personalitySummary: ai?.personalitySummary,
        prediction: ai?.prediction,
        computedAt,
        weekKey,
        refreshCost: ANALYSIS_REFRESH_COST,
        houseInsights: user.houseInsights || {},
    };
}

// GET /astrology/full-analysis 🔐 — haftalık kayıttan okur; kayıt yoksa bir
// kez üretip saklar. Evler/retrolar her zaman yerel hesaptan gelir (hızlı).
router.get('/full-analysis', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        if (!user.birthDate || !user.birthTime) {
            return res.status(400).json({ error: 'Doğum bilgileri eksik.', code: 'MISSING_DATA' });
        }

        const inputData = buildUserInput(user);
        const calcData = performCalculations(inputData);
        const { houses, retrogradePlanets } = buildHousesAndRetros(calcData);

        const weekKey = currentWeekKey();
        const saved = user.weeklyAnalysis;

        // Bu haftanın kaydı varsa: AI ÇAĞRILMAZ, kayıtlı yorum döner.
        if (saved?.weekKey === weekKey && saved?.data) {
            return res.json(analysisResponse(user, houses, retrogradePlanets, saved.data, saved.computedAt, weekKey));
        }

        // Yeni hafta (veya hiç kayıt yok): bir kez üret ve sakla.
        const aiData = await generateInterpretation(
            inputData,
            { sun: calcData.astrology.sun, moon: calcData.astrology.moon, rising: calcData.astrology.rising },
            calcData.numerology
        );

        let computedAt: Date | null = new Date();
        if (!(aiData as any)._fallback) {
            user.weeklyAnalysis = { data: aiData, weekKey, computedAt };
            user.markModified('weeklyAnalysis');
            await user.save();
        } else if (saved?.data) {
            // AI şu an üretemedi → eski haftanın kaydı olduğu gibi kalsın,
            // kullanıcıya en son kayıtlı yorumu göster (sonraki açılışta denenir).
            return res.json(analysisResponse(user, houses, retrogradePlanets, saved.data, saved.computedAt, saved.weekKey));
        }

        return res.json(analysisResponse(user, houses, retrogradePlanets, aiData, computedAt, weekKey));
    } catch (error: any) {
        console.error('Full analysis error:', error);
        return res.status(500).json({ error: 'Analiz hatası', code: 'SERVER_ERROR' });
    }
});

// POST /astrology/full-analysis/refresh 🔐 — kullanıcı isteğiyle yeniden
// yorumlatma (25 kredi). Üretim başarısızsa kredi ALINMAZ.
router.post('/full-analysis/refresh', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });
        if (!user.birthDate || !user.birthTime) {
            return res.status(400).json({ error: 'Doğum bilgileri eksik.', code: 'MISSING_DATA' });
        }
        if (user.credits < ANALYSIS_REFRESH_COST) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: ANALYSIS_REFRESH_COST, available: user.credits }
            });
        }

        const inputData = buildUserInput(user);
        const calcData = performCalculations(inputData);
        const { houses, retrogradePlanets } = buildHousesAndRetros(calcData);

        const aiData = await generateInterpretation(
            inputData,
            { sun: calcData.astrology.sun, moon: calcData.astrology.moon, rising: calcData.astrology.rising },
            calcData.numerology
        );
        if ((aiData as any)._fallback) {
            // Gerçek üretim olmadı → ücret alma
            return res.status(503).json({ error: 'Yorum şu an yenilenemedi, lütfen birazdan tekrar dene. Kredin alınmadı.', code: 'REFRESH_UNAVAILABLE' });
        }

        const weekKey = currentWeekKey();
        const computedAt = new Date();
        user.credits -= ANALYSIS_REFRESH_COST;
        user.weeklyAnalysis = { data: aiData, weekKey, computedAt };
        user.markModified('weeklyAnalysis');
        await user.save();

        return res.json({
            ...analysisResponse(user, houses, retrogradePlanets, aiData, computedAt, weekKey),
            credits: user.credits,
        });
    } catch (error: any) {
        console.error('Analysis refresh error:', error);
        return res.status(500).json({ error: 'Yenileme hatası', code: 'SERVER_ERROR' });
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
