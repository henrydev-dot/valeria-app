import { Router, Response } from 'express';
import { User } from '../models/User';
import { Reading } from '../models/Reading';
import { ReadingRequest } from '../models/ReadingRequest';
import { FalReading } from '../models/FalReading';
import { sendPushToUser } from '../services/push';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations } from '../utils/calculations';
import { generateTarotInterpretation, generateTarotSpreadReading, generateCoffeeReading, askHoraryQuestion, generateNumerologyReading } from '../services/geminiService';
import { buildHistoryBlock, buildNatalBlock } from '../services/promptContext';
import { aiGenerate } from '../services/aiClient';
import { TAROT_CARDS, DEMO_ADVISORS } from '../data/seedData';
import { UserInput, TransitData, PlanetPosition } from '../types';
import { ZODIAC_DATA } from '../constants';

const router = Router();

// POST /readings/tarot 🔐
router.post('/tarot', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { question } = req.body;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Kredi kontrolü (25 kredi)
        if (user.credits < 25) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 25, available: user.credits }
            });
        }

        const deck = [...TAROT_CARDS];
        const randomPicks = [0, 1, 2].map(() => {
            const idx = Math.floor(Math.random() * deck.length);
            return deck.splice(idx, 1)[0];
        });

        // Açılım TEK AI çağrısıyla bütün olarak yorumlanır: kartlar pozisyonlarını
        // (Geçmiş/Şimdi/Gelecek) bilir, birbirine ve kişinin haritasına bağlanır.
        const POSITIONS = ['Geçmiş', 'Şimdi', 'Gelecek'];
        const picks = randomPicks.map((card, i) => ({
            card,
            isReversed: Math.random() > 0.5,
            position: POSITIONS[i],
        }));

        const spread = await generateTarotSpreadReading(
            picks.map((p) => ({
                nameTR: p.card.nameTR,
                isReversed: p.isReversed,
                position: p.position,
                keywordsTR: p.card.keywordsTR,
            })),
            question || '',
            user
        );

        const drawnCards = picks.map((p, i) => ({
            card: { ...p.card },
            isReversed: p.isReversed,
            position: p.position,
            interpretation: spread.interpretations[i] || ''
        }));

        // Kredi düş
        user.credits -= 25;
        await user.save();

        // Sorunun cevabı falın kendi akışında verilir: cevap + sentez tek metin
        // olarak birleşir ve uygulamanın zaten gösterdiği "Genel Değerlendirme"
        // (result.summary) alanından akar — istemci değişikliği gerektirmez.
        const genelYorum = [spread.answer, spread.synthesis].filter(Boolean).join('\n\n');

        // Okuma kaydet (geçmiş özetlerinde kullanılmak üzere result'ta)
        const reading = new Reading({
            userId: user._id.toString(),
            type: 'tarot',
            question: question || '',
            date: new Date(),
            cards: drawnCards,
            result: genelYorum || undefined
        });
        await reading.save();

        return res.json({
            id: reading._id,
            date: reading.date,
            question: reading.question,
            type: 'tarot',
            cards: drawnCards,
            summary: genelYorum
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

        // Kredi kontrolü (25 kredi)
        if (user.credits < 25) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 25, available: user.credits }
            });
        }

        const result = await generateCoffeeReading(images || [], user, question || '');

        // Fincan doğrulanamadıysa fal YOK ve kredi KESİLMEZ.
        if (result.rejected) {
            return res.status(400).json({
                error: result.soruCevabi,
                code: 'INVALID_CUP_PHOTOS'
            });
        }
        if (result.unavailable) {
            return res.status(503).json({
                error: result.soruCevabi,
                code: 'READING_UNAVAILABLE'
            });
        }

        user.credits -= 25;
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

        // SORU ANI HARİTASI (gerçek horary): sorunun sorulduğu an, kişinin
        // koordinatlarında yükselen/Ay/gezegenler + radikallik (erken/geç ASC) notu.
        let momentBlock = '';
        try {
            const isTr = /t[uü]rk|turkey/i.test(user.birthCountry || 'Türkiye');
            const tzOffset = isTr ? 3 : Math.round((parseFloat(user.longitude || '29') || 29) / 15);
            const local = new Date(Date.now() + tzOffset * 3600 * 1000);
            const momentCalc = performCalculations({
                ...inputData,
                birthDate: local.toISOString().slice(0, 10),
                birthTime: local.toISOString().slice(11, 16),
            });
            const asc = momentCalc.astrology.rising;
            const moonNow = momentCalc.astrology.moon;
            const trSign = (x: string) => ZODIAC_DATA[x]?.name || x;
            const radikallik = asc.degree < 3
                ? ' — erken yükselen: konu henüz olgunlaşmamış olabilir'
                : asc.degree > 27
                    ? ' — geç yükselen: konu büyük ölçüde sonuçlanmış olabilir'
                    : '';
            const klasikGezegenler = momentCalc.astrology.planets
                .slice(0, 7) // Güneş..Satürn — horary'de yalnız geleneksel yedili yönetici olur
                .map(p => `${p.planetNameTR} ${trSign(p.sign)} ${p.degree.toFixed(0)}°${p.retrograde ? ' R' : ''}`)
                .join(', ');
            momentBlock = `Yükselen ${trSign(asc.sign)} ${asc.degree.toFixed(1)}°${radikallik}; Ay ${trSign(moonNow.sign)} ${moonNow.degree.toFixed(1)}°; ${klasikGezegenler}`;
        } catch { /* an haritası hesaplanamazsa natal+transit ile devam */ }

        // Geçmiş fallar (tarot kartları dahil) horary yorumuna bağlam olarak gider.
        const historyBlock = await buildHistoryBlock(user._id.toString());

        const horary = await askHoraryQuestion(
            question,
            calcData.astrology.transits,
            calcData.astrology.planets,
            inputData,
            {
                sun: calcData.astrology.sun,
                moon: calcData.astrology.moon,
                rising: calcData.astrology.rising,
            },
            historyBlock,
            momentBlock
        );
        // Geçmiş kayıtları için birleşik metin; UI ayrı alanları kullanır.
        const answer = horary.comment ? `${horary.verdict}\n\n${horary.comment}` : horary.verdict;

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
            answer,
            verdict: horary.verdict,
            comment: horary.comment
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

// POST /readings/advisor-request 🔐
// Tek asenkron fal kuyruğu: advisorId 'valeria' ise falı arka planda yapay
// zeka yorumlar (istek ANINDA döner, cevap 10-15 sn içinde isteğe yazılır ve
// push bildirimi gider); insan danışmansa panelden cevaplanana dek bekler.
const VALERIA_ADVISOR_ID = 'valeria';
// Fiyatlar: Valeria (AI) tarot ve kahve 25'er kredi; gerçek falcıya fal 100 kredi.
const VALERIA_COSTS: Record<string, number> = { tarot: 25, kahve: 25 };
const HUMAN_REQUEST_COST = 100;
const SPREAD_POSITIONS = ['Geçmiş', 'Şimdi', 'Gelecek'];

function drawSpreadCards() {
    const deck = [...TAROT_CARDS];
    return [0, 1, 2].map((i) => {
        const idx = Math.floor(Math.random() * deck.length);
        const card = deck.splice(idx, 1)[0];
        return {
            card,
            name: card.nameTR,
            isReversed: Math.random() > 0.5,
            position: SPREAD_POSITIONS[i],
        };
    });
}

/** Valeria isteğini arka planda yorumlar; hata/red durumunda krediyi iade eder. */
async function processValeriaRequest(requestId: string): Promise<void> {
    const request = await ReadingRequest.findById(requestId);
    if (!request || request.status !== 'pending') return;
    const user = await User.findById(request.userId);
    if (!user) return;

    const refund = async (message: string) => {
        if (request.creditsCharged > 0) {
            await User.updateOne({ _id: request.userId }, { $inc: { credits: request.creditsCharged } });
        }
        request.answer = message;
        request.thread.push({ role: 'advisor', text: message, at: new Date() });
        request.status = 'answered';
        request.answeredAt = new Date();
        await request.save();
    };

    try {
        if (request.type === 'tarot') {
            const picks = (request.cards || []).map((c) => ({
                card: TAROT_CARDS.find((t) => t.nameTR === c.name),
                name: c.name,
                isReversed: c.isReversed,
                position: c.position,
            }));

            const spread = await generateTarotSpreadReading(
                picks.map((p) => ({
                    nameTR: p.name,
                    isReversed: p.isReversed,
                    position: p.position,
                    keywordsTR: p.card?.keywordsTR || [],
                })),
                request.question === '-' ? '' : request.question,
                user
            );

            const genelYorum = [spread.answer, spread.synthesis].filter(Boolean).join('\n\n');
            const kartMetinleri = picks.map((p, i) =>
                `${p.position} — ${p.name}${p.isReversed ? ' (Ters)' : ' (Düz)'}\n${spread.interpretations[i] || ''}`
            );
            request.answer = [...kartMetinleri, genelYorum ? `Genel Değerlendirme\n${genelYorum}` : '']
                .filter(Boolean).join('\n\n');
            request.thread.push({ role: 'advisor', text: request.answer, at: new Date() });
            request.status = 'answered';
            request.answeredAt = new Date();
            await request.save();

            // Geçmiş/kişiselleştirme için okuma kaydı
            await new Reading({
                userId: request.userId,
                type: 'tarot',
                question: request.question === '-' ? '' : request.question,
                date: new Date(),
                cards: picks.map((p, i) => ({
                    card: p.card ? { ...p.card } : { nameTR: p.name },
                    isReversed: p.isReversed,
                    position: p.position,
                    interpretation: spread.interpretations[i] || '',
                })),
                result: genelYorum || undefined,
            }).save();
        } else {
            // kahve
            const result = await generateCoffeeReading(request.images || [], user, request.question === '-' ? '' : request.question);

            if (result.rejected) {
                await refund(
                    'Fotoğraflar net bir kahve fincanı olarak doğrulanamadı, bu yüzden falına bakamadım. ' +
                    `Harcanan ${request.creditsCharged} kredi hesabına iade edildi. ` +
                    'Fincanın içini, kenarlarını ve tabağını aydınlık bir ortamda net çekip yeniden gönderebilirsin.'
                );
                await sendPushToUser(request.userId, 'Kahve Falın Hakkında', 'Fotoğraflar doğrulanamadı, kredin iade edildi. Yeni fotoğraflarla tekrar deneyebilirsin.', { requestId: request._id });
                return;
            }
            if (result.unavailable) {
                await refund(
                    'Şu an yoğunluk nedeniyle fincanını okuyamadım. ' +
                    `Harcanan ${request.creditsCharged} kredi hesabına iade edildi. Birazdan tekrar dener misin?`
                );
                await sendPushToUser(request.userId, 'Kahve Falın Hakkında', 'Geçici bir yoğunluk oldu, kredin iade edildi. Birazdan tekrar deneyebilirsin.', { requestId: request._id });
                return;
            }

            const bolumler: Array<[string, string | undefined]> = [
                ['Sorunun Cevabı', result.soruCevabi],
                ['Aşk Hayatı', result.askHayati],
                ['Kariyer & İş Hayatı', result.kariyer],
                ['Aile & Yakınlar', result.aile],
            ];
            request.answer = bolumler
                .filter(([, text]) => !!text)
                .map(([baslik, text]) => `${baslik}\n${text}`)
                .join('\n\n');
            request.thread.push({ role: 'advisor', text: request.answer, at: new Date() });
            request.status = 'answered';
            request.answeredAt = new Date();
            await request.save();

            await new Reading({
                userId: request.userId,
                type: 'coffee',
                question: request.question === '-' ? '' : request.question,
                date: new Date(),
                result: JSON.stringify(result),
                imageUri: null,
            }).save();
        }

        await sendPushToUser(
            request.userId,
            'Falın Hazır',
            `Valeria ${request.type === 'tarot' ? 'tarot açılımını' : 'kahve falını'} yorumladı. Görmek için dokun.`,
            { requestId: request._id }
        );
    } catch (error) {
        console.error('Valeria async fal hatası:', error);
        await refund(
            'Teknik bir sorun nedeniyle falını tamamlayamadım. ' +
            `Harcanan ${request.creditsCharged} kredi hesabına iade edildi. Lütfen birazdan tekrar dene.`
        );
        await sendPushToUser(request.userId, 'Falın Hakkında', 'Teknik bir sorun oluştu, kredin iade edildi. Birazdan tekrar deneyebilirsin.', { requestId: request._id });
    }
}

router.post('/advisor-request', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { advisorId, type, question, images } = req.body;
        if (!advisorId || !type) {
            return res.status(400).json({ error: 'Danışman ve tür zorunludur', code: 'MISSING_FIELDS' });
        }
        const isValeria = String(advisorId) === VALERIA_ADVISOR_ID;
        // Tarotta soru isteğe bağlı (model zorunlu tuttuğu için '-' saklanır)
        const soru = (question || '').trim();
        if (!soru && type !== 'tarot') {
            return res.status(400).json({ error: 'Soru zorunludur', code: 'MISSING_FIELDS' });
        }
        if (type === 'kahve') {
            if (!images || !Array.isArray(images) || images.length !== 4) {
                return res.status(400).json({ error: 'Kahve falı için tam 4 fincan fotoğrafı zorunludur', code: 'MISSING_IMAGES' });
            }
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Ücret: Valeria → tür bazlı; insan danışman → sabit; seans → 0 (seans
        // paketi zaten ayrıca ücretlendirildi).
        const cost = isValeria
            ? (VALERIA_COSTS[type] ?? 10)
            : (type === 'advisor_session' ? 0 : HUMAN_REQUEST_COST);

        if (user.credits < cost) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: cost, available: user.credits }
            });
        }
        if (cost > 0) {
            user.credits -= cost;
            await user.save();
        }

        // Danışman adı (panelde ve uygulamada gösterim için) — sabit kadrodan
        // çözülür; veritabanındaki eski kayıtlar sonucu etkileyemez.
        let advisorName = 'Valeria';
        if (!isValeria) {
            const adv = DEMO_ADVISORS.find((a) => String(a.advisorId) === String(advisorId));
            advisorName = adv?.name || 'Danışman';
        }

        // Tarot isteklerinde kartlar sunucuda çekilir: hem panel hem uygulama
        // hangi kartların açıldığını görür; Valeria da aynı kartları yorumlar.
        const cards = type === 'tarot'
            ? drawSpreadCards().map((p) => ({ name: p.name, cardId: p.card.id, isReversed: p.isReversed, position: p.position }))
            : [];

        const request = new ReadingRequest({
            userId: user._id.toString(),
            advisorId: String(advisorId),
            advisorName,
            type,
            question: soru || '-',
            status: 'pending',
            images: type === 'kahve' ? images : [],
            cards,
            creditsCharged: cost,
            // Sohbet dizisi ilk kullanıcı sorusuyla başlar
            thread: soru ? [{ role: 'user', text: soru, at: new Date() }] : [],
        });
        await request.save();

        // Valeria: cevap arka planda üretilir — istek ANINDA döner.
        if (isValeria) {
            setImmediate(() => {
                processValeriaRequest(request._id.toString()).catch((e) =>
                    console.error('processValeriaRequest:', e)
                );
            });
        }

        return res.json({
            id: request._id,
            advisorId: String(advisorId),
            advisorName,
            type,
            question: soru,
            cards,
            status: 'pending',
            createdAt: request.createdAt,
        });
    } catch (error: any) {
        console.error('Advisor request error:', error);
        return res.status(500).json({ error: error.message || 'Fal isteği gönderilemedi', code: 'SERVER_ERROR' });
    }
});

// GET /readings/advisor-requests 🔐
// NOT: 'images' HARİÇ — 4 adet base64 fotoğraf istek başına birkaç MB tutuyor
// ve liste yüklemesini dakikalarca uzatıyordu. Liste yalnız metin verisi taşır.
router.get('/advisor-requests', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const requests = await ReadingRequest.find({ userId: userId.toString() })
            .select('-images')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        return res.json(requests);
    } catch (error: any) {
        return res.status(500).json({ error: 'İstekler yüklenemedi', code: 'SERVER_ERROR' });
    }
});

// GET /readings/advisor-requests/:id 🔐 — fal sohbet ekranı için tek istek
router.get('/advisor-requests/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const request = await ReadingRequest.findOne({
            _id: req.params.id,
            userId: req.user!._id.toString(),
        }).select('-images').lean();
        if (!request) return res.status(404).json({ error: 'Fal isteği bulunamadı', code: 'NOT_FOUND' });
        return res.json(request);
    } catch (error: any) {
        return res.status(500).json({ error: 'İstek yüklenemedi', code: 'SERVER_ERROR' });
    }
});

// GET /readings/advisor-requests/:id/images 🔐 — kahve fincanı fotoğrafları.
// Sohbet metni anında yüklensin diye ayrı tutulur; ekran fotoğrafları
// arkadan tembel yükler.
router.get('/advisor-requests/:id/images', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const request = await ReadingRequest.findOne({
            _id: req.params.id,
            userId: req.user!._id.toString(),
        }).select('images').lean();
        if (!request) return res.status(404).json({ error: 'Fal isteği bulunamadı', code: 'NOT_FOUND' });
        return res.json({ images: request.images || [] });
    } catch (error: any) {
        return res.status(500).json({ error: 'Fotoğraflar yüklenemedi', code: 'SERVER_ERROR' });
    }
});

// POST /readings/advisor-requests/:id/follow-up 🔐 — fala özel ek soru (10 kredi)
// Valeria: yanıt arka planda üretilip sohbete eklenir + bildirim gider.
// İnsan danışman: istek yeniden 'pending' olur, panelde görünür, panelden
// verilen cevap sohbete eklenir.
const FOLLOW_UP_COST = 10;
const MAX_THREAD_MESSAGES = 40;

async function processValeriaFollowUp(requestId: string): Promise<void> {
    const request = await ReadingRequest.findById(requestId);
    if (!request) return;
    const user = await User.findById(request.userId);
    if (!user) return;

    try {
        const kartSatiri = (request.cards || [])
            .map((c) => `${c.position}: ${c.name}${c.isReversed ? ' (Ters)' : ''}`)
            .join(', ');
        const sohbet = request.thread
            .map((m) => `${m.role === 'user' ? 'Danışan' : 'Valeria'}: ${m.text}`)
            .join('\n\n');

        const prompt = [
            `FAL TÜRÜ: ${request.type === 'tarot' ? 'Tarot açılımı (Geçmiş/Şimdi/Gelecek)' : 'Kahve falı'}`,
            kartSatiri ? `AÇILAN KARTLAR: ${kartSatiri}` : '',
            buildNatalBlock(user),
            'ŞİMDİYE KADARKİ FAL SOHBETİ (GİZLİ bağlam — birebir alıntılama):',
            sohbet,
            '',
            'GÖREV: Danışanın SON sorusuna, yukarıdaki falın bütünlüğünü koruyarak yanıt ver.',
            'Aynı falın devamı gibi konuş; kartlara/fincana atıfta bulunabilirsin.',
            'Soruya net cevap ver, 2-4 paragrafı geçme. Selamlaşma ve kapanış cümlesi yazma.',
        ].filter(Boolean).join('\n');

        const cevap = (await aiGenerate(prompt, { tier: 'quality' })).trim();
        if (!cevap) throw new Error('Boş yanıt');

        request.thread.push({ role: 'advisor', text: cevap, at: new Date() });
        request.status = 'answered';
        request.answeredAt = new Date();
        await request.save();

        await sendPushToUser(request.userId, 'Valeria Yanıtladı', 'Ek sorunun cevabı hazır. Görmek için dokun.', { requestId: request._id });
    } catch (error) {
        console.error('Valeria follow-up hatası:', error);
        // Krediyi iade et ve durumu cevaplanmışa çek ki sohbet kilitlenmesin
        await User.updateOne({ _id: request.userId }, { $inc: { credits: FOLLOW_UP_COST } });
        request.thread.push({
            role: 'advisor',
            text: 'Teknik bir sorun nedeniyle bu soruna şu an yanıt veremedim; 10 kredin iade edildi. Lütfen birazdan tekrar sor.',
            at: new Date(),
        });
        request.status = 'answered';
        await request.save();
    }
}

router.post('/advisor-requests/:id/follow-up', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const question = (req.body?.question || '').trim();
        if (!question) return res.status(400).json({ error: 'Soru zorunludur', code: 'MISSING_FIELDS' });
        if (question.length > 500) return res.status(400).json({ error: 'Soru çok uzun (en fazla 500 karakter)', code: 'TOO_LONG' });

        const request = await ReadingRequest.findOne({
            _id: req.params.id,
            userId: req.user!._id.toString(),
        });
        if (!request) return res.status(404).json({ error: 'Fal isteği bulunamadı', code: 'NOT_FOUND' });
        if (request.status !== 'answered') {
            return res.status(400).json({ error: 'Önce falının yorumlanmasını bekle', code: 'STILL_PENDING' });
        }
        if (request.thread.length >= MAX_THREAD_MESSAGES) {
            return res.status(400).json({ error: 'Bu fal sohbeti en fazla soruya ulaştı. Yeni bir fal baktırabilirsin.', code: 'THREAD_FULL' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });
        if (user.credits < FOLLOW_UP_COST) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: FOLLOW_UP_COST, available: user.credits }
            });
        }
        user.credits -= FOLLOW_UP_COST;
        await user.save();

        request.thread.push({ role: 'user', text: question, at: new Date() });
        request.status = 'pending'; // cevap gelene dek "yanıt bekleniyor"
        await request.save();

        if (request.advisorId === VALERIA_ADVISOR_ID) {
            setImmediate(() => {
                processValeriaFollowUp(request._id.toString()).catch((e) =>
                    console.error('processValeriaFollowUp:', e)
                );
            });
        }
        // İnsan danışman: istek 'pending' olarak panele düşer; panelden verilen
        // cevap sohbete eklenir.

        const fresh = await ReadingRequest.findById(request._id).select('-images').lean();
        return res.json(fresh);
    } catch (error: any) {
        console.error('Follow-up error:', error);
        return res.status(500).json({ error: 'Ek soru gönderilemedi', code: 'SERVER_ERROR' });
    }
});

export default router;
