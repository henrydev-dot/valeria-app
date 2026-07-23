import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { _id: string; email: string };
}

const IS_PROD = process.env.NODE_ENV === 'production';

// Resolve a JWT secret. In production a missing secret is a hard failure rather
// than a silent insecure fallback.
function resolveSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const val = process.env[name];
    if (val && val.length >= 16) return val;
    if (IS_PROD) {
        throw new Error(`${name} is not set (or too short) in production. Refusing to use an insecure fallback.`);
    }
    return name === 'JWT_SECRET' ? 'dev_only_access_secret_change_me' : 'dev_only_refresh_secret_change_me';
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Yetkilendirme gerekli', code: 'UNAUTHORIZED' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, resolveSecret('JWT_SECRET')) as { _id: string; email: string };

        req.user = { _id: decoded._id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token', code: 'INVALID_TOKEN' });
    }
};

export const generateTokens = (userId: string, email: string) => {
    const accessToken = jwt.sign(
        { _id: userId, email },
        resolveSecret('JWT_SECRET'),
        { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
        { _id: userId, email },
        resolveSecret('JWT_REFRESH_SECRET'),
        { expiresIn: '30d' }
    );
    return { accessToken, refreshToken };
};

// Simple admin guard for /admin routes: requires the x-admin-key header to match
// ADMIN_API_KEY. In production the key MUST be set, else all admin routes are denied.
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const configured = process.env.ADMIN_API_KEY;
    if (!configured) {
        if (IS_PROD) return res.status(503).json({ error: 'Admin devre dışı', code: 'ADMIN_DISABLED' });
        return next(); // dev convenience only
    }
    if (req.headers['x-admin-key'] !== configured) {
        return res.status(403).json({ error: 'Erişim reddedildi', code: 'FORBIDDEN' });
    }
    next();
};
