import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const APPLE_ISS = 'https://appleid.apple.com';
const APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys';
// Accept either configured client id or the app's known bundle id.
const APPLE_AUDIENCES = [process.env.APPLE_CLIENT_ID, 'com.astrovaleria.app'].filter(Boolean) as string[];

interface AppleJwk { kid: string; n: string; e: string; kty: string; alg: string }
let _keyCache: { keys: AppleJwk[]; at: number } | null = null;

async function fetchAppleKeys(): Promise<AppleJwk[]> {
    // Cache Apple's public keys for 12h.
    if (_keyCache && Date.now() - _keyCache.at < 12 * 60 * 60 * 1000) return _keyCache.keys;
    const res = await fetch(APPLE_KEYS_URL);
    if (!res.ok) throw new Error(`Apple keys fetch failed: ${res.status}`);
    const data = (await res.json()) as { keys: AppleJwk[] };
    _keyCache = { keys: data.keys, at: Date.now() };
    return data.keys;
}

export interface AppleIdentity { sub: string; email?: string; emailVerified?: boolean }

/**
 * Verify an Apple Sign In identity token (JWT) against Apple's public keys.
 * Returns the verified identity (sub = stable Apple user id) or throws.
 */
export async function verifyAppleIdentityToken(identityToken: string): Promise<AppleIdentity> {
    const decodedHeader = jwt.decode(identityToken, { complete: true }) as { header: { kid: string; alg: string } } | null;
    if (!decodedHeader?.header?.kid) throw new Error('Geçersiz Apple token başlığı');

    const keys = await fetchAppleKeys();
    const jwk = keys.find((k) => k.kid === decodedHeader.header.kid);
    if (!jwk) throw new Error('Apple imza anahtarı bulunamadı');

    const publicKey = crypto.createPublicKey({ key: jwk as any, format: 'jwk' });
    const payload = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: APPLE_ISS,
        audience: APPLE_AUDIENCES as [string, ...string[]],
    }) as any;

    return { sub: payload.sub, email: payload.email, emailVerified: payload.email_verified === 'true' || payload.email_verified === true };
}

/**
 * Apple Sign In token revocation (App Store Guideline 5.1.1(v)).
 *
 * Fully functional once these env vars are set (see APPLE_REVIEW.md):
 *   APPLE_TEAM_ID, APPLE_CLIENT_ID (bundle id), APPLE_KEY_ID,
 *   APPLE_PRIVATE_KEY (contents of the .p8, newlines as \n)
 *
 * Requires the user's stored Apple refresh token (captured at sign-in from the
 * authorization code). If any piece is missing this is a safe no-op that logs,
 * so account deletion still proceeds (user data is always removed).
 */
export function appleConfigured(): boolean {
    return !!(
        process.env.APPLE_TEAM_ID &&
        process.env.APPLE_CLIENT_ID &&
        process.env.APPLE_KEY_ID &&
        process.env.APPLE_PRIVATE_KEY
    );
}

function makeClientSecret(): string {
    const privateKey = (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
        {
            iss: process.env.APPLE_TEAM_ID,
            iat: now,
            exp: now + 60 * 5,
            aud: 'https://appleid.apple.com',
            sub: process.env.APPLE_CLIENT_ID,
        },
        privateKey,
        { algorithm: 'ES256', keyid: process.env.APPLE_KEY_ID }
    );
}

export async function revokeAppleToken(appleRefreshToken?: string | null): Promise<boolean> {
    if (!appleConfigured() || !appleRefreshToken) {
        console.warn('[apple] revoke skipped (not configured or no stored refresh token)');
        return false;
    }
    try {
        const body = new URLSearchParams({
            client_id: process.env.APPLE_CLIENT_ID!,
            client_secret: makeClientSecret(),
            token: appleRefreshToken,
            token_type_hint: 'refresh_token',
        });
        const res = await fetch('https://appleid.apple.com/auth/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!res.ok) {
            console.error('[apple] revoke failed:', res.status, await res.text());
            return false;
        }
        return true;
    } catch (e) {
        console.error('[apple] revoke error:', e);
        return false;
    }
}
