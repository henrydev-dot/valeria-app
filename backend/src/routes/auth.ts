import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generateTokens } from '../middleware/authMiddleware';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email ve şifre zorunludur', code: 'MISSING_FIELDS' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı', code: 'WEAK_PASSWORD' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Bu email zaten kayıtlı', code: 'EMAIL_EXISTS' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name: name || 'Kullanıcı' });

        const tokens = generateTokens(user._id.toString(), email);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error: any) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu', code: 'SERVER_ERROR' });
    }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email ve şifre zorunludur', code: 'MISSING_FIELDS' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Geçersiz email veya şifre', code: 'INVALID_CREDENTIALS' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Geçersiz email veya şifre', code: 'INVALID_CREDENTIALS' });
        }

        // Streak kontrolü
        const now = new Date();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
        if (lastLogin) {
            const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                user.streakDays += 1;
            } else if (diffDays > 1) {
                user.streakDays = 1;
            }
        } else {
            user.streakDays = 1;
        }

        // Günlük soru hakkı reset
        const today = now.toISOString().split('T')[0];
        const lastReset = user.lastResetDate ? new Date(user.lastResetDate).toISOString().split('T')[0] : '';
        if (today !== lastReset) {
            user.dailyQuestionsRemaining = 3;
            user.lastResetDate = now;
        }

        user.lastLoginDate = now;

        const tokens = generateTokens(user._id.toString(), user.email);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Giriş sırasında bir hata oluştu', code: 'SERVER_ERROR' });
    }
});

// POST /auth/apple
router.post('/apple', async (req: Request, res: Response) => {
    try {
        const { appleId, email, name } = req.body;

        if (!appleId) {
            return res.status(400).json({ error: 'Apple ID zorunludur', code: 'MISSING_FIELDS' });
        }

        let user = await User.findOne({ appleId });

        if (!user) {
            // Yeni kullanıcı oluştur
            user = new User({
                appleId,
                email: email || `${appleId}@apple.private`,
                name: name || 'Apple Kullanıcı'
            });
        }

        const tokens = generateTokens(user._id.toString(), user.email);
        user.refreshToken = tokens.refreshToken;
        user.lastLoginDate = new Date();
        await user.save();

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                onboardingComplete: user.onboardingComplete
            }
        });
    } catch (error: any) {
        console.error('Apple auth error:', error);
        return res.status(500).json({ error: 'Apple giriş hatası', code: 'SERVER_ERROR' });
    }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token zorunludur', code: 'MISSING_TOKEN' });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
        ) as { _id: string; email: string };

        const user = await User.findById(decoded._id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ error: 'Geçersiz refresh token', code: 'INVALID_TOKEN' });
        }

        const tokens = generateTokens(user._id.toString(), user.email);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error: any) {
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' });
    }
});

export default router;
