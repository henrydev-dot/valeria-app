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

        // Günlük ödül durumu: alınmışsa bir sonraki hak zamanı (istemci geri
        // sayım gösterir), alınabilir durumdaysa null.
        const rewardLast = user.lastDailyRewardAt ? new Date(user.lastDailyRewardAt).getTime() : 0;
        const rewardNext = rewardLast + 24 * 60 * 60 * 1000;
        const dailyRewardAvailableAt = rewardLast && rewardNext > Date.now() ? new Date(rewardNext) : null;

        return res.json({
            credits: user.credits,
            xp: user.xp,
            level: user.level,
            streakDays: user.streakDays,
            dailyQuestionsRemaining: user.dailyQuestionsRemaining,
            unlockedContentIds: user.unlockedContentIds,
            lastResetDate: user.lastResetDate,
            lastLoginDate: user.lastLoginDate,
            dailyRewardAvailableAt
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

// POST /entitlements/ad-watch 🔐 — günlük ücretsiz ödül (isim geriye uyumluluk için)
// 24 saatte bir kez, 25 kredi. Süre dolmadıysa kalan süreyle 429 döner.
const DAILY_REWARD_CREDITS = 25;
const DAILY_REWARD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

router.post('/ad-watch', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const now = Date.now();
        const last = user.lastDailyRewardAt ? new Date(user.lastDailyRewardAt).getTime() : 0;
        const elapsed = now - last;
        if (elapsed < DAILY_REWARD_COOLDOWN_MS) {
            const remainingMs = DAILY_REWARD_COOLDOWN_MS - elapsed;
            const hours = Math.floor(remainingMs / 3600000);
            const minutes = Math.ceil((remainingMs % 3600000) / 60000);
            return res.status(429).json({
                error: `Günlük ödülünü zaten aldın. Yeni ödül ${hours} saat ${minutes} dakika sonra hazır.`,
                code: 'REWARD_COOLDOWN',
                details: { remainingMs, nextAvailableAt: new Date(last + DAILY_REWARD_COOLDOWN_MS) }
            });
        }

        user.credits += DAILY_REWARD_CREDITS;
        user.lastDailyRewardAt = new Date(now);
        await user.save();

        return res.json({
            credits: user.credits,
            rewarded: DAILY_REWARD_CREDITS,
            nextAvailableAt: new Date(now + DAILY_REWARD_COOLDOWN_MS)
        });
    } catch (error: any) {
        return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
    }
});

// POST /entitlements/add-credits 🔐 — ESKİ mock satın alma.
// Gerçek IAP devrede olduğu için varsayılan KAPALI; yalnız ALLOW_MOCK_PURCHASES=true
// (test ortamı) iken çalışır. Eski build'ler çağırırsa kibar bir hata alır.
router.post('/add-credits', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if ((process.env.ALLOW_MOCK_PURCHASES || '').toLowerCase() !== 'true') {
            return res.status(403).json({
                error: 'Kredi satın almak için lütfen uygulamayı güncelleyin.',
                code: 'MOCK_PURCHASES_DISABLED'
            });
        }
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

// ─── GERÇEK APPLE IAP DOĞRULAMA ─────────────────────────────────────
// Consumable kredi paketleri. İstemci satın alma sonrası base64 makbuzu
// gönderir; sunucu Apple verifyReceipt ile doğrular (prod → 21007 ise sandbox),
// transaction_id tekrarına karşı korunur ve krediyi SUNUCU tarafı belirler.
import { CREDIT_PACKAGES } from '../data/seedData';

const APPLE_VERIFY_PROD = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

async function verifyWithApple(receiptData: string): Promise<any> {
    const body: any = { 'receipt-data': receiptData };
    if (process.env.APPLE_SHARED_SECRET) body.password = process.env.APPLE_SHARED_SECRET;

    const call = async (url: string) => {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return r.json() as Promise<any>;
    };

    let result = await call(APPLE_VERIFY_PROD);
    // 21007: sandbox makbuzu prod'a gönderilmiş (TestFlight/inceleme) → sandbox'ta dene
    if (result?.status === 21007) result = await call(APPLE_VERIFY_SANDBOX);
    return result;
}

router.post('/verify-purchase', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { receiptData, productId, transactionId } = req.body;
        if (!receiptData || !productId) {
            return res.status(400).json({ error: 'receiptData ve productId zorunludur', code: 'MISSING_FIELDS' });
        }

        const pkg = CREDIT_PACKAGES.find(p => p.id === productId);
        if (!pkg) {
            return res.status(400).json({ error: 'Bilinmeyen ürün', code: 'UNKNOWN_PRODUCT' });
        }

        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        const appleResult = await verifyWithApple(receiptData);
        if (!appleResult || appleResult.status !== 0) {
            console.error('[IAP] Apple doğrulama başarısız, status:', appleResult?.status);
            return res.status(400).json({
                error: 'Satın alma doğrulanamadı. Ödeme alındıysa "Satın almaları geri yükle" ile tekrar deneyin.',
                code: 'RECEIPT_INVALID',
                details: { appleStatus: appleResult?.status }
            });
        }

        // Makbuz içinde bu ürün + işlem gerçekten var mı?
        const inApp: any[] = appleResult?.receipt?.in_app || [];
        const tx = inApp.find(t =>
            t.product_id === productId &&
            (!transactionId || t.transaction_id === transactionId)
        );
        if (!tx) {
            return res.status(400).json({ error: 'Makbuzda bu ürüne ait işlem bulunamadı', code: 'TX_NOT_FOUND' });
        }

        // Aynı işlemin ikinci kez kredilendirilmesini engelle (replay koruması)
        if (user.processedTransactionIds.includes(tx.transaction_id)) {
            return res.json({ credits: user.credits, alreadyProcessed: true });
        }

        user.credits += pkg.credits;
        user.processedTransactionIds.push(tx.transaction_id);
        // Liste sınırsız büyümesin
        if (user.processedTransactionIds.length > 200) {
            user.processedTransactionIds = user.processedTransactionIds.slice(-200);
        }
        await user.save();

        console.log(`[IAP] ${user.email} → ${pkg.id} (${pkg.credits} kredi), tx=${tx.transaction_id}`);
        return res.json({ credits: user.credits, added: pkg.credits, transactionId: tx.transaction_id });
    } catch (error: any) {
        console.error('[IAP] verify-purchase error:', error);
        return res.status(500).json({ error: 'Satın alma doğrulama hatası', code: 'SERVER_ERROR' });
    }
});

// GET /entitlements/packages — istemcinin göstereceği paket listesi (fiyatlar
// vitrin içindir; gerçek fiyat App Store'dan gelir)
router.get('/packages', authMiddleware, async (_req: AuthRequest, res: Response) => {
    return res.json(CREDIT_PACKAGES);
});

export default router;
