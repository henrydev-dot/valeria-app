import { Router, Response } from 'express';
import { Advisor } from '../models/Advisor';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

const router = Router();

// GET /advisors 🔐
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
    try {
        const advisors = await Advisor.find().sort({ rating: -1 });
        return res.json(advisors.map(a => ({
            id: a.advisorId,
            name: a.name,
            specialties: a.specialties,
            rating: a.rating,
            sessions: a.sessions,
            bio: a.bio,
            packages: a.packages,
            reviews: a.reviews
        })));
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /advisors/request 🔐
router.post('/request', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { advisorId, question } = req.body;
        if (!advisorId || !question) {
            return res.status(400).json({ error: 'advisorId ve question zorunludur', code: 'MISSING_FIELDS' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Minimum kredi kontrolü (15dk = 30 kredi)
        if (user.credits < 30) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 30, available: user.credits }
            });
        }

        const now = new Date();
        const estimatedResponse = new Date(now.getTime() + 60 * 60 * 1000); // 1 saat sonra

        return res.json({
            requestId: `req_${Date.now()}`,
            advisorId: advisorId.toString(),
            status: 'pending',
            estimatedResponse: estimatedResponse.toISOString()
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
