import React from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '../src/stores/useUserStore';

export default function Index() {
    const isAuthenticated = useUserStore((s) => s.isAuthenticated);
    const onboardingComplete = useUserStore((s) => s.profile.onboardingComplete);

    if (isAuthenticated && onboardingComplete) {
        return <Redirect href="/(tabs)" />;
    }

    // Go to auth flow — login first, then onboarding
    return <Redirect href="/(auth)/login" />;
}
