import { Router, Response } from 'express';
import { User } from '../models/User';
import { Reading } from '../models/Reading';
import { ReadingRequest } from '../models/ReadingRequest';
import { FalReading } from '../models/FalReading';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations } from '../utils/calculations';
import { generateTarotInterpretation, generateCoffeeReading, askHoraryQuestion, generateNumerologyReading } from '../services/geminiService';
import { buildHistoryBlock } from '../services/promptContext';
import { TAROT_CARDS } from '../data/seedData';
import { UserInput, TransitData, PlanetPosition } from '../types';

const router = Router();

// POST /readings/tarot 🔐
router.post('/tarot', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { question } = req.body;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Kredi kontrolü (30 kredi)
        if (user.credits < 30) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 30, available: user.credits }
            });
        }

        const deck = [...TAROT_CARDS];
        const randomPicks = [0, 1, 2].map(() => {
            const idx = Math.floor(Math.random() * deck.length);
            return deck.splice(idx, 1)[0];
        });

        const drawnCards = await Promise.all(
            randomPicks.map(async (card) => {
                const isReversed = Math.random() > 0.5;
                const interpretation = await generateTarotInterpretation(
                    card.nameTR,
                    isReversed,
                    question || '',
                    user
                );
                return {
                    card: { ...card },
                    isReversed,
                    interpretation
                };
            })
        );

        // Kredi düş
        user.credits -= 30;
        await user.save();

        // Okuma kaydet
        const reading = new Reading({
            userId: user._id.toString(),
            type: 'tarot',
            question: question || '',
            date: new Date(),
            cards: drawnCards
        });
        await reading.save();

        return res.json({
            id: reading._id,
            date: reading.date,
            question: reading.question,
            type: 'tarot',
            cards: drawnCards
        });
    } catch (error: any) {
        console.error('Tarot reading error:', error);
        return res.status(500).json({ error: 'Tarot okuma hatası', code: 'SERVER_ERROR' });
    }
});

// POST /readings/tarot-ai 🔐 (free personalized AI reading for daily tarot)
router.post('/tarot-ai', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { cardName, isReversed, sunSign } = req.body;
        if (!cardName) return res.status(400).json({ error: 'cardName gerekli' });

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const reading = await generateTarotInterpretation(
            cardName,
            isReversed || false,
            '',
            user
        );

        return res.json({ reading });
    } catch (error: any) {
        console.error('Tarot AI reading error:', error);
        return res.status(500).json({ error: 'AI yorum hatası' });
    }
});

// POST /readings/coffee 🔐
router.post('/coffee', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { question, images } = req.body;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Kredi kontrolü (20 kredi)
        if (user.credits < 20) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 20, available: user.credits }
            });
        }

        const result = await generateCoffeeReading(images || [], user, question || '');

        user.credits -= 20;
        await user.save();

        const reading = new Reading({
            userId: user._id.toString(),
            type: 'coffee',
            question: question || '',
            date: new Date(),
            result: JSON.stringify(result),
            imageUri: null
        });
        await reading.save();

        return res.json({
            id: reading._id,
            date: reading.date,
            question: question || '',
            result,
            imageUri: null
        });
    } catch (error: any) {
        console.error('Coffee reading error:', error);
        return res.status(500).json({ error: 'Kahve falı hatası', code: 'SERVER_ERROR' });
    }
});

// POST /readings/question 🔐
router.post('/question', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Soru zorunludur', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Kayıtta 1 kere ücretsiz soru hakkı + premium günlük 2 soru
        const isPremium = user.membershipType === 'premium';
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastReset = user.lastResetDate ? new Date(user.lastResetDate).toISOString().split('T')[0] : '';
        if (today !== lastReset) {
            user.dailyQuestionsRemaining = isPremium ? 2 : 0;
            user.lastResetDate = now;
        }

        // Check one-time free question (registration gift)
        const isFirstFreeQuestion = !(user as any).freeQuestionUsed;
        const hasDailyFree = user.dailyQuestionsRemaining > 0;
        const isFreeQuestion = isFirstFreeQuestion || hasDailyFree;

        // Ücretsiz hak yoksa kredi kontrolü (150 kredi)
        if (!isFreeQuestion && user.credits < 150) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 150, available: user.credits }
            });
        }

        // Mevcut hesaplama sistemi ile transit ve gezegen verilerini hesapla
        const inputData: UserInput = {
            name: user.name,
            birthDate: user.birthDate || '1990-01-01',
            birthTime: user.birthTime || '12:00',
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

        // Geçmiş fallar (tarot kartları dahil) horary yorumuna bağlam olarak gider.
        const historyBlock = await buildHistoryBlock(user._id.toString());

        const answer = await askHoraryQuestion(
            question,
            calcData.astrology.transits,
            calcData.astrology.planets,
            inputData,
            {
                sun: calcData.astrology.sun,
                moon: calcData.astrology.moon,
                rising: calcData.astrology.rising,
            },
            historyBlock
        );

        // Ücretsiz hak varsa düş, yoksa kredi düş
        if (isFirstFreeQuestion) {
            (user as any).freeQuestionUsed = true;
        } else if (hasDailyFree) {
            user.dailyQuestionsRemaining -= 1;
        } else {
            user.credits -= 150;
        }
        await user.save();

        const reading = new Reading({
            userId: user._id.toString(),
            type: 'question',
            question,
            date: new Date(),
            answer
        });
        await reading.save();

        return res.json({
            id: reading._id,
            date: reading.date,
            question,
            answer
        });
    } catch (error: any) {
        console.error('Question error:', error);
        return res.status(500).json({ error: 'Soru hatası', code: 'SERVER_ERROR' });
    }
});

// GET /readings/history 🔐
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;

        // Yeni Reading modelinden
        const newReadings = await Reading.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // Eski FalReading modelinden de al (geriye uyumluluk)
        const oldReadings = await FalReading.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        const combined = [
            ...newReadings.map(r => ({
                id: r._id,
                date: r.date || r.createdAt,
                question: r.question,
                type: r.type,
                cards: r.cards,
                result: r.result,
                answer: r.answer
            })),
            ...oldReadings.map(r => ({
                id: r._id,
                date: r.createdAt,
                question: '',
                type: 'analysis',
                astrology: r.astrology,
                aiInterpretation: r.aiInterpretation,
                horaryQuestions: r.horaryQuestions
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return res.json(combined);
    } catch (error: any) {
        return res.status(500).json({ error: 'Geçmiş yüklenirken hata', code: 'SERVER_ERROR' });
    }
});

// POST /readings/numerology-ai 🔐
router.post('/numerology-ai', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { lifePath, expression, soulUrge, personality } = req.body;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        if (user.credits < 45) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 45, available: user.credits }
            });
        }

        const result = await generateNumerologyReading(
            user.name,
            user.birthDate || '',
            lifePath, expression, soulUrge, personality,
            user
        );

        user.credits -= 45;
        user.numerologyAI = result;
        await user.save();

        return res.json(result);
    } catch (error: any) {
        console.error('Numerology AI error:', error);
        return res.status(500).json({ error: 'Numeroloji yorumu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /readings/advisor-request 🔐 (queue for real fortune tellers)
router.post('/advisor-request', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { advisorId, type, question, images } = req.body;
        if (!advisorId || !type || !question) {
            return res.status(400).json({ error: 'Danışman, tür ve soru zorunludur', code: 'MISSING_FIELDS' });
        }
        if (type === 'kahve') {
            if (!images || !Array.isArray(images) || images.length !== 4) {
                return res.status(400).json({ error: 'Kahve falı için tam 4 fincan fotoğrafı zorunludur', code: 'MISSING_IMAGES' });
            }
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // 10 kredi
        if (user.credits < 10) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 10, available: user.credits }
            });
        }

        user.credits -= 10;
        await user.save();

        const request = new ReadingRequest({
            userId: user._id.toString(),
            advisorId,
            type,
            question,
            status: 'pending',
            images: type === 'kahve' ? images : [],
        });
        await request.save();

        return res.json({
            id: request._id,
            advisorId,
            type,
            question,
            status: 'pending',
            createdAt: request.createdAt,
        });
    } catch (error: any) {
        console.error('Advisor request error:', error);
        return res.status(500).json({ error: error.message || 'Fal isteği gönderilemedi', code: 'SERVER_ERROR', raw: error });
    }
});

// GET /readings/advisor-requests 🔐
router.get('/advisor-requests', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const requests = await ReadingRequest.find({ userId: userId.toString() })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        return res.json(requests);
    } catch (error: any) {
        return res.status(500).json({ error: 'İstekler yüklenemedi', code: 'SERVER_ERROR' });
    }
});

export default router;
