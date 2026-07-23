import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';

const TAB_BAR_BASE_HEIGHT = 60;

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.backgroundCard,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: TAB_BAR_BASE_HEIGHT + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
                    paddingTop: Spacing.sm,
                },
                tabBarActiveTintColor: Colors.accentYellow,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ana Sayfa',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="astrology"
                options={{
                    title: 'Astroloji',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="planet-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reading"
                options={{
                    title: 'Fal',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="eye-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="discover"
                options={{
                    title: 'Keşfet',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="compass-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            {/* Hidden — advisors are surfaced inside the Fal tab, not the tab bar */}
            <Tabs.Screen name="advisors" options={{ href: null }} />
        </Tabs>
    );
}
