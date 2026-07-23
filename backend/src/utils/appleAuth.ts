import jwt from 'jsonwebtoken';

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
