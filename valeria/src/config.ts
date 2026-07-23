/**
 * App-wide configuration and legal links.
 * URLs are surfaced in onboarding, profile, and App Store metadata.
 */
export const Config = {
    appName: 'Valeria',
    supportEmail: 'destek@valeria.app',
    privacyUrl: 'https://valeria.app/privacy',
    termsUrl: 'https://valeria.app/terms',
    supportUrl: 'https://valeria.app/support',
    deleteInfoUrl: 'https://valeria.app/account-deletion',
    // Entertainment disclaimer shown where readings are produced.
    disclaimer:
        'Valeria içeriği eğlence ve kişisel içgörü amaçlıdır; profesyonel tıbbi, hukuki veya finansal tavsiye yerine geçmez.',
} as const;
