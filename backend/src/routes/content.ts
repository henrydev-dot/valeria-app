import { Router, Response } from 'express';
import { User } from '../models/User';
import { Content } from '../models/Content';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /content 🔐
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { category } = req.query;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const filter: any = {};
        if (category) filter.category = category;

        const contents = await Content.find(filter);

        const result = contents.map(c => ({
            _id: c._id,
            contentId: c.contentId,
            category: c.category,
            title: c.title,
            description: c.description,
            detail: (c.isFree || (user.unlockedContentIds as string[]).includes(c.contentId)) ? c.detail : undefined,
            gradient: c.gradient,
            isFree: c.isFree,
            unlockCost: c.unlockCost,
            tip: c.tip,
            isUnlocked: c.isFree || (user.unlockedContentIds as string[]).includes(c.contentId)
        }));

        return res.json(result);
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /content/:contentId/unlock 🔐
router.post('/:contentId/unlock', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const contentId = req.params.contentId as string;
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const content = await Content.findOne({ contentId });
        if (!content) return res.status(404).json({ error: 'İçerik bulunamadı', code: 'NOT_FOUND' });

        if (content.isFree || (user.unlockedContentIds as string[]).includes(contentId as string)) {
            return res.json({
                _id: content._id,
                contentId: content.contentId,
                category: content.category,
                title: content.title,
                description: content.description,
                detail: content.detail,
                gradient: content.gradient,
                isFree: content.isFree,
                unlockCost: content.unlockCost,
                tip: content.tip,
                isUnlocked: true
            });
        }

        if (user.credits < content.unlockCost) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: content.unlockCost, available: user.credits }
            });
        }

        user.credits -= content.unlockCost;
        user.unlockedContentIds.push(contentId as string);
        await user.save();

        return res.json({
            _id: content._id,
            contentId: content.contentId,
            category: content.category,
            title: content.title,
            description: content.description,
            detail: content.detail,
            gradient: content.gradient,
            isFree: content.isFree,
            unlockCost: content.unlockCost,
            tip: content.tip,
            isUnlocked: true
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /content/runes/random 🔐
router.post('/runes/random', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const runes = await Content.find({ category: 'rune' });
        if (runes.length === 0) {
            return res.status(404).json({ error: 'Rün bulunamadı', code: 'NOT_FOUND' });
        }

        const randomRune = runes[Math.floor(Math.random() * runes.length)];

        // Kredi kontrolü ve harcama
        if (user.credits < 5) {
            return res.status(400).json({
                error: 'Yetersiz kredi',
                code: 'INSUFFICIENT_CREDITS',
                details: { required: 5, available: user.credits }
            });
        }

        user.credits -= 5;
        if (!(user.unlockedContentIds as string[]).includes(randomRune.contentId)) {
            user.unlockedContentIds.push(randomRune.contentId);
        }
        await user.save();

        return res.json({
            _id: randomRune._id,
            contentId: randomRune.contentId,
            category: randomRune.category,
            title: randomRune.title,
            description: randomRune.description,
            detail: randomRune.detail,
            isFree: randomRune.isFree,
            unlockCost: randomRune.unlockCost,
            isUnlocked: true
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
