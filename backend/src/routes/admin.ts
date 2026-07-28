import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Reading } from '../models/Reading';
import { ReadingRequest } from '../models/ReadingRequest';
import { Expo } from 'expo-server-sdk';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require the x-admin-key header (see authMiddleware.adminMiddleware).
router.use(adminMiddleware);

// GET /admin/stats - Sistem istatistikleri
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const premiumUsers = await User.countDocuments({ membershipType: 'premium' });
        const totalReadings = await Reading.countDocuments();
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('email name createdAt');

        res.json({
            totalUsers,
            premiumUsers,
            totalReadings,
            recentUsers,
            status: 'online',
            uptime: process.uptime()
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// GET /admin/readings - Son fal istekleri
router.get('/readings', async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const readings = await Reading.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            // If Reading model has user ref, we would populate it
            // .populate('user', 'email name')
            .lean();

        res.json({ readings });
    } catch (error: any) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// POST /admin/notifications - Bildirim gönderme simülasyonu/API çağrısı
router.post('/notifications', async (req: Request, res: Response) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ error: 'Başlık ve mesaj zorunludur' });
        }

        const usersWithTokens = await User.find({ pushToken: { $exists: true, $ne: '' } }).select('pushToken');
        const tokens = usersWithTokens.map((u: any) => u.pushToken);

        if (tokens.length === 0) {
            return res.json({ success: true, message: 'Gönderilecek push token bulunamadı', sentCount: 0 });
        }

        // Expo Push API çağrısı (Gerçek ortamda mesajlar parse edilip batched gönderilmeli)
        const messages = tokens.map((token: string) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: { category: 'admin_broadcast' },
        }));

        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });
            const data = await response.json();
            res.json({ success: true, message: 'Bildirimler sıraya eklendi', sentCount: tokens.length, expoResponse: data });
        } catch (fetchError: any) {
            res.json({ success: false, message: 'Expo API Hatası, sadece veritabanı simüle edildi', sentCount: tokens.length });
        }
    } catch (error: any) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// GET /admin/requests - Bekleyen danışman fal istekleri
router.get('/requests', async (req: Request, res: Response) => {
    try {
        const requests = await ReadingRequest.find({ status: 'pending' })
            .sort({ createdAt: 1 }) // First in, first out
            .lean();

        res.json({ requests });
    } catch (error: any) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

// POST /admin/requests/:id/answer - Danışman falına cevap ver
router.post('/requests/:id/answer', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({ error: 'Cevap metni zorunludur' });
        }

        const request = await ReadingRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Fal isteği bulunamadı' });
        }

        request.answer = answer;
        // Fal sohbetine de ekle — uygulamadaki chat ekranı thread'i gösterir
        request.thread.push({ role: 'advisor', text: answer, at: new Date() });
        request.status = 'answered';
        request.answeredAt = new Date();
        await request.save();

        // Push Notification Gönderimi
        try {
            const user = await User.findById(request.userId);
            if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
                let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
                await expo.sendPushNotificationsAsync([{
                    to: user.pushToken,
                    sound: 'default',
                    title: 'Falın Yorumlandı! ✨',
                    body: 'Danışmanın falını yorumladı. Hemen görmek için dokun!',
                    data: { requestId: request._id },
                }]);
            }
        } catch (pushErr) {
            console.error("Push Notification Hatası:", pushErr);
        }

        res.json({ success: true, request });
    } catch (error: any) {
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
    }
});

export default router;
