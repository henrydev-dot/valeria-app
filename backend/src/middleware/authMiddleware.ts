import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { _id: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Yetkilendirme gerekli', code: 'UNAUTHORIZED' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { _id: string; email: string };

        req.user = { _id: decoded._id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' });
    }
};

export const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign(
        { _id: userId, email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
        { _id: userId, email },
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        { expiresIn: '30d' }
    );
    return { accessToken, refreshToken };
};
