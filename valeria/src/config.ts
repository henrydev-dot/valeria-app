/**
 * App-wide configuration and legal links.
 * URLs are surfaced in onboarding, profile, and App Store metadata.
 */
export const Config = {
    appName: 'Valeria',
    // NOTE: domain must match the deployed landing site (land/). Currently the
    // landing uses valeria.today; change all of these together if the domain differs.
    supportEmail: 'support@valeria.today',
    privacyUrl: 'https://valeria.today/privacy',
    termsUrl: 'https://valeria.today/terms',
    supportUrl: 'https://valeria.today/support',
    deleteInfoUrl: 'https://valeria.today/account-deletion',
    // Entertainment disclaimer shown where readings are produced.
    disclaimer:
        'Valeria içeriği eğlence ve kişisel içgörü amaçlıdır; profesyonel tıbbi, hukuki veya finansal tavsiye yerine geçmez.',
} as const;

/**
 * Feature flags.
 *
 * For the first App Store submission we ship WITHOUT in-app purchases
 * (Guideline 3.1.1): all paid/credit-purchase and fake-ad flows are hidden and
 * the app is fully free — credits are only earned (daily reward, streak, level,
 * first free question). Flip `purchasesEnabled` back to true once real StoreKit
 * IAP + server-side receipt validation are wired.
 */
export const Features = {
    // Gerçek StoreKit IAP kodu hazır (buy-credits + backend verify-purchase),
    // ancak Paid Apps sözleşmesi/evraklar tamamlanana kadar KAPALI tutuluyor.
    // Ürünler ASC'de onaylanınca true yapıp yeni build almak yeterli.
    purchasesEnabled: false,
    adsEnabled: false, // no real ad SDK — hide "reklam izle"; use honest daily reward instead
} as const;
