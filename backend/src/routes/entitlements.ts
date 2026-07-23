import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /entitlements 🔐
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Günlük reset kontrolü
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastReset = user.lastResetDate ? new Date(user.lastResetDate).toISOString().split('T')[0] : '';
        if (today !== lastReset) {
            const isPremium = user.membershipType === 'premium';
            user.dailyQuestionsRemaining = isPremium ? 2 : 0;
            user.lastResetDate = now;
            await user.save();
        }

        return res.json({
            credits: user.credits,
            xp: user.xp,
            level: user.level,
            streakDays: user.streakDays,
            dailyQuestionsRemaining: user.dailyQuestionsRemaining,
            unlockedContentIds: user.unlockedContentIds,
            lastResetDate: user.lastResetDate,
            lastLoginDate: user.lastLoginDate
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /entitlements/spend 🔐
router.post('/spend', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { amount, reason, contentId } = req.body;

        if (!amount || !reason) {
            return res.status(400).json({ error: 'amount ve reason zorunludur', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        if (user.credits < amount) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: amount, available: user.credits }
            });
        }

        user.credits -= amount;

        if (contentId && !user.unlockedContentIds.includes(contentId)) {
            user.unlockedContentIds.push(contentId);
        }

        await user.save();

        return res.json({
            credits: user.credits,
            unlockedContentIds: user.unlockedContentIds
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /entitlements/earn 🔐
router.post('/earn', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { xp } = req.body;
        if (!xp || xp <= 0) {
            return res.status(400).json({ error: 'Geçerli XP miktarı gerekli', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        user.xp += xp;
        // Her 500 XP = 1 Level
        user.level = Math.floor(user.xp / 500) + 1;
        await user.save();

        return res.json({
            xp: user.xp,
            level: user.level
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /entitlements/ad-watch 🔐
router.post('/ad-watch', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        user.credits += 10;
        await user.save();

        return res.json({ credits: user.credits });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});
// POST /entitlements/add-credits 🔐 (mock in-app purchase)
router.post('/add-credits', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { amount, packageName } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Geçerli kredi miktarı gerekli', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        user.credits += amount;
        await user.save();

        return res.json({ credits: user.credits, added: amount, packageName });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
