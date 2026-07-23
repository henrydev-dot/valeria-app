import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '../src/stores/useUserStore';
import { useEntitlementsStore } from '../src/stores/useEntitlementsStore';
import { useContentStore } from '../src/stores/useContentStore';
import { Colors } from '../src/theme/colors';
import * as api from '../src/api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        if (token) {
            await api.push.saveToken(token);
        }
    } catch (e) {
        console.log("Push token error:", e);
    }
}

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const loadProfile = useUserStore((s) => s.loadProfile);
    const loadEntitlements = useEntitlementsStore((s) => s.load);
    const loadContent = useContentStore((s) => s.loadAll);

    useEffect(() => {
        async function bootstrap() {
            try {
                const token = await api.getToken();
                if (token) {
                    // Authenticated — load everything from API
                    await loadProfile();
                    await Promise.allSettled([loadEntitlements(), loadContent()]);
                    // Push registration is deferred to an in-app priming prompt,
                    // not fired cold at startup.
                } else {
                    // Not authenticated — just load local content (home templates etc.)
                    await loadContent();
                }
            } catch (e) {
                console.warn('Bootstrap error:', e);
            } finally {
                setIsReady(true);
            }
        }
        bootstrap();
    }, []);

    if (!isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.accentYellow} />
                <StatusBar style="light" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.flex}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: Colors.backgroundDark },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="tarot-reading" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="coffee-reading" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="reading-history" />
                    <Stack.Screen name="advisor-detail" />
                    <Stack.Screen name="learning-card" />
                    <Stack.Screen name="buy-credits" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="ask-question" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="pendulum" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="delete-account" />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export { registerForPushNotificationsAsync };

const styles = StyleSheet.create({
    flex: { flex: 1 },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundDark,
    },
});
