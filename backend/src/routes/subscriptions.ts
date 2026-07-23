import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { SUBSCRIPTION_PLANS } from '../data/seedData';

const router = Router();

// GET /subscriptions/plans (public)
router.get('/plans', (_req: any, res: Response) => {
    return res.json(SUBSCRIPTION_PLANS);
});

// POST /subscriptions/purchase 🔐
router.post('/purchase', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { planId, receipt, platform } = req.body;
        if (!planId) {
            return res.status(400).json({ error: 'planId zorunludur', code: 'MISSING_FIELDS' });
        }

        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan bulunamadı', code: 'NOT_FOUND' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Demo: receipt doğrulaması yok, direkt aktive et
        if (plan.id !== 'plan_free') {
            user.membershipType = 'premium';
        }
        user.credits += plan.credits;
        await user.save();

        const now = new Date();
        const endDate = new Date(now);
        if (plan.period === 'yıllık') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        return res.json({
            subscription: {
                planId: plan.id,
                status: 'active',
                startDate: now.toISOString(),
                endDate: endDate.toISOString()
            },
            credits: user.credits
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// GET /subscriptions/status 🔐
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const isPremium = user.membershipType === 'premium';
        return res.json({
            planId: isPremium ? 'plan_premium' : 'plan_free',
            status: 'active',
            startDate: user.createdAt.toISOString(),
            endDate: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
            autoRenew: isPremium
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
