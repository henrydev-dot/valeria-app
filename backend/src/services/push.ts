import { Expo } from 'expo-server-sdk';
import { User } from '../models/User';

/**
 * Kullanıcıya push bildirimi gönderir. Token yoksa veya gönderim başarısız
 * olursa sessizce geçer — bildirim hiçbir akışın hata sebebi olmamalı.
 */
export async function sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data: Record<string, unknown> = {}
): Promise<void> {
    try {
        const user = await User.findById(userId).select('pushToken');
        const token = user?.pushToken;
        if (!token || !Expo.isExpoPushToken(token)) return;

        const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
        await expo.sendPushNotificationsAsync([{
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }]);
    } catch (err) {
        console.error('Push gönderim hatası:', err);
    }
}
