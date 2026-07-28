import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Route imports
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import entitlementRoutes from './routes/entitlements';
import contentRoutes from './routes/content';
import readingRoutes from './routes/readings';
import advisorRoutes from './routes/advisors';
import astrologyRoutes from './routes/astrology';
import transitRoutes from './routes/transits';
import dailyTarotRoutes from './routes/dailyTarot';
import subscriptionRoutes from './routes/subscriptions';
import adminRoutes from './routes/admin';
import { TURKISH_CITIES } from './constants';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (god images, tarot cards, etc.)
// Görseller sürümsüz ve nadiren değişir — istemci 30 gün önbelleğe alsın ki
// ana sayfa kartları/arketip görselleri ikinci açılıştan itibaren anında gelsin.
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images'), {
    maxAge: '30d',
    immutable: false,
    etag: true,
}));

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/entitlements', entitlementRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/transits', transitRoutes);
app.use('/api/daily-tarot', dailyTarotRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Utility Routes
app.get('/api/cities', (_req, res) => {
    res.json({ success: true, data: TURKISH_CITIES });
});

app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        service: 'Valeria API',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Root route - API Documentation
app.get('/', (_req, res) => {
    res.json({
        service: 'Valeria API',
        version: '2.0.0',
        description: 'Mistik astroloji & fal uygulaması API',
        auth: 'JWT Bearer Token',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                apple: 'POST /api/auth/apple',
                refresh: 'POST /api/auth/refresh'
            },
            profile: {
                get: 'GET /api/profile 🔐',
                update: 'PUT /api/profile 🔐',
                onboarding: 'POST /api/profile/onboarding 🔐',
                pushToken: 'PUT /api/profile/push-token 🔐'
            },
            entitlements: {
                get: 'GET /api/entitlements 🔐',
                spend: 'POST /api/entitlements/spend 🔐',
                earn: 'POST /api/entitlements/earn 🔐',
                adWatch: 'POST /api/entitlements/ad-watch 🔐'
            },
            content: {
                list: 'GET /api/content 🔐',
                unlock: 'POST /api/content/:contentId/unlock 🔐',
                randomRune: 'POST /api/content/runes/random 🔐'
            },
            readings: {
                tarot: 'POST /api/readings/tarot 🔐',
                coffee: 'POST /api/readings/coffee 🔐',
                question: 'POST /api/readings/question 🔐',
                history: 'GET /api/readings/history 🔐'
            },
            advisors: {
                list: 'GET /api/advisors 🔐',
                request: 'POST /api/advisors/request 🔐'
            },
            astrology: {
                daily: 'GET /api/astrology/daily 🔐',
                weekly: 'GET /api/astrology/weekly 🔐',
                natalChart: 'GET /api/astrology/natal-chart 🔐',
                compatibility: 'POST /api/astrology/compatibility 🔐'
            },
            transits: 'GET /api/transits 🔐',
            dailyTarot: 'GET /api/daily-tarot 🔐',
            subscriptions: {
                plans: 'GET /api/subscriptions/plans',
                purchase: 'POST /api/subscriptions/purchase 🔐',
                status: 'GET /api/subscriptions/status 🔐'
            },
            utility: {
                cities: 'GET /api/cities',
                health: 'GET /api/health'
            }
        }
    });
});

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        console.log('🔌 MongoDB bağlantısı kuruluyor...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB bağlantısı başarılı (valerifal)');

        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Valeria API v2.0 çalışıyor: http://0.0.0.0:${PORT}`);
            console.log(`📋 API Dökümantasyon: http://localhost:${PORT}`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:', error);
        process.exit(1);
    }
};

startServer();
