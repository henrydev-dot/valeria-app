import { Router, Response } from 'express';
import { User } from '../models/User';
import { DailyTarot } from '../models/DailyTarot';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { generateDailyTarotMessage } from '../services/geminiService';
import { TAROT_CARDS } from '../data/seedData';

const router = Router();

// GET /daily-tarot 🔐
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const today = new Date().toISOString().split('T')[0];

        // Bugün zaten çekilmiş mi?
        let existing = await DailyTarot.findOne({ userId: user._id.toString(), date: today });

        if (existing) {
            const card = TAROT_CARDS.find(c => c.id === existing!.cardId);
            return res.json({
                date: today,
                card: card || TAROT_CARDS[0],
                isReversed: existing.isReversed,
                dailyMessage: existing.dailyMessage
            });
        }

        // Yeni kart çek (kullanıcı ID + tarih bazlı deterministic seed)
        const seed = user._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + parseInt(today.replace(/-/g, ''));
        const cardId = seed % 22;
        const isReversed = (seed % 3) === 0;

        const card = TAROT_CARDS.find(c => c.id === cardId) || TAROT_CARDS[0];
        const dailyMessage = await generateDailyTarotMessage(card.nameTR, isReversed, user.sunSign || 'Koç');

        const dailyTarot = new DailyTarot({
            userId: user._id.toString(),
            date: today,
            cardId: card.id,
            isReversed,
            dailyMessage
        });

        await dailyTarot.save();

        return res.json({
            date: today,
            card,
            isReversed,
            dailyMessage
        });
    } catch (error: any) {
        console.error('Daily tarot error:', error);
        return res.status(500).json({ error: 'Günlük tarot hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
