import React, { useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, AppText, Button, Card } from '../../src/components';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontWeight } from '../../src/theme/spacing';
import { Features } from '../../src/config';

const UNLOCK_COST = 5;

// When purchases are disabled, tell users how to earn credits for free instead
// of leaving them at a dead end (no "buy credits" path exists in this build).
const EARN_HINT = Features.purchasesEnabled
    ? ''
    : ' Krediler ücretsiz kazanılıyor: profildeki günlük ödülünü al, serini sürdür ve seviye atlayarak kredi topla.';

type MCIName = keyof typeof MaterialCommunityIcons.glyphMap;

interface DiscoverItem {
    id: string;
    title: string;
    desc: string;
    free: boolean;
    /** Kartın vurgu rengi (rozet, kenarlık, ikon). */
    color: string;
    /** Profesyonel sembol: MaterialCommunityIcons adı... */
    icon?: MCIName;
    /** ...veya otantik runik karakter (Unicode — emoji değil). */
    rune?: string;
    detail: string;
    tip?: string;
}

// --- Data ---
const KRISTAL_ITEMS: DiscoverItem[] = [
    {
        id: 'k1', title: 'Ametist', desc: 'Huzur ve ruhsal koruma taşı', free: true, color: '#8B5CF6', icon: 'diamond-stone',
        detail: 'Ametist, en güçlü koruyucu taşlardan biridir. Stresi azaltır, sezgiyi güçlendirir ve uyku kalitesini artırır. Meditasyon sırasında kullanıldığında üst çakraları açar. Yastık altına koyarak huzurlu bir uyku için kullanabilirsiniz.'
    },
    {
        id: 'k2', title: 'Pembe Kuvars', desc: 'Aşk ve şefkat enerjisi', free: false, color: '#EC4899', icon: 'heart-outline',
        detail: 'Pembe Kuvars, koşulsuz aşk taşıdır. Kalp çakrasını açar, öz sevgiyi ve başkalarına duyulan şefkati güçlendirir. İlişkilerde uyumu destekler ve duygusal yaraları iyileştirmeye yardımcı olur.'
    },
    {
        id: 'k3', title: 'Obsidyen', desc: 'Negatif enerji kalkanı', free: false, color: '#94A3B8', icon: 'shield-outline',
        detail: 'Obsidyen, negatif enerjilere karşı güçlü bir kalkan oluşturur. Topraklama enerjisi sağlar, karanlıktaki gerçekleri ortaya çıkarır ve ruhsal koruma sağlar. Kapınızın yanına koyarak evinizi koruyabilirsiniz.'
    },
    {
        id: 'k4', title: 'Selenit', desc: 'Arındırma ve aydınlanma', free: false, color: '#E2E8F0', icon: 'star-four-points-outline',
        detail: 'Selenit, en yüksek titreşimli taşlardan biridir. Diğer kristalleri arındırır ve şarj eder. Mekansal temizlik için odanızda bulundurun. Taç çakrasını açar ve ruhsal aydınlanmayı destekler.'
    },
    {
        id: 'k5', title: 'Kaplan Gözü', desc: 'Cesaret ve güç taşı', free: false, color: '#F59E0B', icon: 'eye-outline',
        detail: 'Kaplan Gözü, cesaret ve özgüven verir. Karar verme süreçlerinde netlik sağlar, kötü niyetli enerjilere karşı korur. İş hayatında başarı için cebinizde taşıyabilirsiniz.'
    },
    {
        id: 'k6', title: 'Ay Taşı', desc: 'Sezgi ve iç huzur', free: false, color: '#818CF8', icon: 'moon-waning-crescent',
        detail: 'Ay Taşı, kadın enerjisini ve sezgisel yetenekleri güçlendirir. Ay döngüsüyle uyum sağlar, duygusal dengeyi destekler. Yeni ay dönemlerinde şarj ederek en yüksek etkiyi alabilirsiniz.'
    },
];

const RUN_ITEMS: DiscoverItem[] = [
    {
        id: 'r1', title: 'Fehu', desc: 'Refah ve bolluk runu', free: true, color: '#F59E0B', rune: 'ᚠ',
        detail: 'Fehu, maddi bolluk ve refahın sembolüdür. Cüzdanınıza veya iş yerinize çizerek finansal bereket çağırabilirsiniz. Yeni başlangıçlar ve yatırımlar için ideal bir rundur.', tip: 'Cüzdanınıza çizin, maddi bereket için'
    },
    {
        id: 'r2', title: 'Algiz', desc: 'Koruma ve savunma', free: true, color: '#10B981', rune: 'ᛉ',
        detail: 'Algiz, en güçlü koruma runudur. Kötü enerjilere, nazara ve olumsuz etkilere karşı kalkan oluşturur. Kapılarınıza veya pencerelere çizerek evinizi koruyabilirsiniz.', tip: 'Kapınıza çizin, kötü enerjilere karşı'
    },
    {
        id: 'r3', title: 'Ansuz', desc: 'Bilgelik ve iletişim', free: false, color: '#3B82F6', rune: 'ᚨ',
        detail: 'Ansuz, ilahi bilgelik ve iletişim runudur. Doğru kararlara ulaşmanızı sağlar. Önemli görüşmeler öncesi bileğinize çizebilirsiniz.', tip: 'Bileğinize çizin, doğru kararlar için'
    },
    {
        id: 'r4', title: 'Raidho', desc: 'Yolculuk ve hareket', free: false, color: '#8B5CF6', rune: 'ᚱ',
        detail: 'Raidho, güvenli yolculuk ve doğru yolu bulma runudur. Fiziksel ve ruhsal yolculuklarda rehberlik eder.', tip: 'Ayakkabınıza çizin, güvenli yolculuk için'
    },
    {
        id: 'r5', title: 'Sowilo', desc: 'Güneş enerjisi ve başarı', free: false, color: '#EF4444', rune: 'ᛊ',
        detail: 'Sowilo, güneş enerjisi taşıyan zafer runudur. Başarı, sağlık ve yaşam gücü verir. Avucunuza çizerek güne enerjik başlayın.', tip: 'Avucunuza çizin, motivasyon için'
    },
    {
        id: 'r6', title: 'Wunjo', desc: 'Mutluluk ve harmoni', free: false, color: '#EC4899', rune: 'ᚹ',
        detail: 'Wunjo, mutluluk, şifa ve iç huzur runudur. İlişkilerde uyumu ve hayattan zevk almayı destekler. Yastık altına çizerek huzurlu uyku için kullanın.', tip: 'Yastık altına çizin, huzurlu uyku için'
    },
];

const RITUAL_ITEMS: DiscoverItem[] = [
    {
        id: 'rt1', title: 'Yeni Ay Ritüeli', desc: 'Yeni başlangıçlar ve niyet belirleme', free: true, color: '#6366F1', icon: 'moon-new',
        detail: 'Yeni ay, niyet koyma ve yeni başlangıçlar için en güçlü zamandır. Sessiz bir ortamda oturun, niyetlerinizi kağıda yazın, bir mum yakın ve evrenle paylaşın. 3 gün boyunca niyetlerinizi tekrarlayın.'
    },
    {
        id: 'rt2', title: 'Dolunay Ritüeli', desc: 'Bırakma ve arındırma', free: false, color: '#F59E0B', icon: 'moon-full',
        detail: 'Dolunay, artık size hizmet etmeyen şeyleri bırakma zamanıdır. Bırakmak istediklerinizi kağıda yazın, güvenli bir şekilde yakın. Ay ışığında meditasyon yapın ve arının.'
    },
    {
        id: 'rt3', title: 'Sabah Meditasyonu', desc: 'Güne pozitif enerji ile başla', free: false, color: '#F97316', icon: 'meditation',
        detail: '5 dakika sessizce oturun, nefes alın. Gününüz için pozitif niyetlerinizi belirleyin. Minnettarlık listenizi zihninizde gözden geçirin. Her gün tekrarlayarak alışkanlık haline getirin.'
    },
    {
        id: 'rt4', title: 'Tuz Banyosu', desc: 'Enerji temizleme ritüeli', free: false, color: '#14B8A6', icon: 'waves',
        detail: 'Banyo suyuna bir avuç deniz tuzu ve birkaç damla lavanta yağı ekleyin. 20 dakika bekleyin ve negatif enerjilerin suda eridiğini hayal edin. Haftada bir uygulayın.'
    },
    {
        id: 'rt5', title: 'Mum Ritüeli', desc: 'Niyet gücünü artırma', free: false, color: '#EF4444', icon: 'candle',
        detail: 'Niyetinize uygun renkte bir mum seçin (yeşil: bereket, kırmızı: aşk, beyaz: arındırma). Mumu yakarken niyetinizi tekrarlayın. Mum kendi kendine sönene kadar yakın.'
    },
    {
        id: 'rt6', title: 'Kristal Şarj Ritüeli', desc: 'Kristallerinizi ay ışığında şarj edin', free: false, color: '#A78BFA', icon: 'auto-fix',
        detail: 'Dolunay gecesi kristallerinizi pencere kenarına veya dışarıya yerleştirin. Sabaha kadar ay ışığında bırakın. Kristaller arınır ve yeniden enerjiyle dolar. Ayda bir tekrarlayın.'
    },
];

type TabKey = 'kristal' | 'run' | 'ritual';

const TAB_DESCRIPTIONS: Record<TabKey, string> = {
    kristal: '“Her taş, dünyanın hafızasından bir parça taşır.”',
    run: '“Runlar, kadim kuzeyin fısıltılarıdır.”',
    ritual: '“Niyet, evrene gönderilen ilk kıvılcımdır.”',
};

/** Öğenin sembolü: MCI ikonu ya da otantik runik harf. */
function ItemSymbol({ item, size, color }: { item: DiscoverItem; size: number; color: string }) {
    if (item.rune) {
        return (
            <AppText style={{ fontSize: size, lineHeight: size * 1.2, color, fontWeight: FontWeight.bold }}>
                {item.rune}
            </AppText>
        );
    }
    return <MaterialCommunityIcons name={item.icon || 'star-four-points-outline'} size={size} color={color} />;
}

export default function DiscoverScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('kristal');
    const [detailItem, setDetailItem] = useState<DiscoverItem | null>(null);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const spendCredits = useEntitlementsStore((s) => s.spendCredits);
    const earnXP = useEntitlementsStore((s) => s.earnXP);
    // Persisted, DB-backed unlocks survive restarts (aligned with home screen)
    const unlockedContentIds = useEntitlementsStore((s) => s.unlockedContentIds);

    const tabs: { key: TabKey; label: string; icon: MCIName }[] = [
        { key: 'kristal', label: 'Kristaller', icon: 'diamond-stone' },
        { key: 'run', label: 'Runler', icon: 'script-text-outline' },
        { key: 'ritual', label: 'Ritüeller', icon: 'moon-waning-crescent' },
    ];

    const getItems = (): DiscoverItem[] => {
        if (activeTab === 'kristal') return KRISTAL_ITEMS;
        if (activeTab === 'run') return RUN_ITEMS;
        return RITUAL_ITEMS;
    };

    // Günün enerjisi: tarihe göre deterministik seçim — her gün değişir.
    const dailyPick = useMemo(() => {
        const all = [...KRISTAL_ITEMS, ...RUN_ITEMS, ...RITUAL_ITEMS];
        const dayIndex = Math.floor(Date.now() / 86400000);
        return all[dayIndex % all.length];
    }, []);

    const isUnlocked = (item: DiscoverItem) => item.free || unlockedContentIds.includes(item.id);

    const handlePress = async (item: DiscoverItem) => {
        if (isUnlocked(item)) {
            setDetailItem(item);
            await earnXP(5);
            return;
        }
        // Unlock with credits (spendCredits is async → MUST be awaited)
        setUnlocking(item.id);
        const ok = await spendCredits(UNLOCK_COST, 'discover_unlock', item.id);
        setUnlocking(null);
        if (ok) {
            setDetailItem(item);
            await earnXP(10);
        } else {
            Alert.alert('Yetersiz Kredi', `Bu içeriği açmak için ${UNLOCK_COST} kredi gerekiyor.${EARN_HINT}`);
        }
    };

    const handleRandomRune = async () => {
        const locked = RUN_ITEMS.filter((r) => !r.free && !unlockedContentIds.includes(r.id));
        if (locked.length === 0) {
            Alert.alert('Tüm Runler Açık', 'Tüm runleri zaten açtınız!');
            return;
        }
        const pick = locked[Math.floor(Math.random() * locked.length)];
        setUnlocking('random');
        const ok = await spendCredits(UNLOCK_COST, 'discover_unlock', pick.id);
        setUnlocking(null);
        if (ok) {
            setDetailItem(pick);
            await earnXP(10);
        } else {
            Alert.alert('Yetersiz Kredi', `Rastgele run açmak için ${UNLOCK_COST} kredi gerekiyor.${EARN_HINT}`);
        }
    };

    return (
        <Screen edges={['top']}>
            {/* Mistik başlık */}
            <View style={styles.headerBlock}>
                <AppText variant="hero">Keşfet</AppText>
                <AppText variant="body" color={Colors.textSecondary} style={styles.headerSub}>
                    Kadim bilgeliğin kapısı: kristaller, runlar ve ritüeller
                </AppText>
            </View>

            {/* Günün Enerjisi */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePress(dailyPick)}
                accessibilityRole="button"
                accessibilityLabel={`Günün enerjisi: ${dailyPick.title}`}
            >
                <LinearGradient
                    colors={[dailyPick.color + '4D', Colors.surface1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.dailyCard, { borderColor: dailyPick.color + '55' }]}
                >
                    <View style={[styles.dailyIconWrap, { backgroundColor: dailyPick.color + '26', borderColor: dailyPick.color + '66' }]}>
                        <ItemSymbol item={dailyPick} size={26} color={dailyPick.color} />
                    </View>
                    <View style={styles.dailyInfo}>
                        <View style={styles.dailyBadge}>
                            <Ionicons name="today-outline" size={11} color={Colors.accentYellow} />
                            <AppText variant="label" color={Colors.accentYellow} style={styles.dailyBadgeText}>
                                GÜNÜN ENERJİSİ
                            </AppText>
                        </View>
                        <AppText variant="h2">{dailyPick.title}</AppText>
                        <AppText variant="caption" color={Colors.textSecondary}>{dailyPick.desc}</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.segmented}>
                {tabs.map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.segment, active && styles.segmentActive]}
                            onPress={() => setActiveTab(tab.key)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={tab.label}
                        >
                            <MaterialCommunityIcons name={tab.icon} size={16}
                                color={active ? Colors.textOnAccent : Colors.textMuted} />
                            <AppText
                                variant="callout"
                                color={active ? Colors.textOnAccent : Colors.textMuted}
                                style={active ? styles.segmentTextActive : undefined}
                            >
                                {tab.label}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Mistik bölüm alıntısı */}
            <AppText variant="callout" color={Colors.purpleLight} style={styles.sectionQuote}>
                {TAB_DESCRIPTIONS[activeTab]}
            </AppText>

            {/* Content Grid */}
            <View style={styles.grid}>
                {getItems().map((item) => {
                    const unlocked = isUnlocked(item);
                    const busy = unlocking === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, { borderColor: item.color + '3D' }]}
                            activeOpacity={0.85}
                            disabled={busy}
                            onPress={() => handlePress(item)}
                            accessibilityRole="button"
                            accessibilityLabel={
                                unlocked
                                    ? `${item.title} — detayları gör`
                                    : `${item.title} — ${UNLOCK_COST} kredi ile aç`
                            }
                        >
                            <View style={styles.cardTop}>
                                <View style={[styles.iconWrap, { backgroundColor: item.color + '1F', borderColor: item.color + '4D' }]}>
                                    <ItemSymbol item={item} size={22} color={item.color} />
                                </View>
                                {!unlocked ? (
                                    <View style={styles.lockBadge}>
                                        <Ionicons name="lock-closed" size={9} color={Colors.textSecondary} />
                                        <AppText variant="label" color={Colors.textSecondary} style={styles.badgeText}>
                                            {UNLOCK_COST}
                                        </AppText>
                                    </View>
                                ) : item.free ? (
                                    <View style={styles.freeBadge}>
                                        <AppText variant="label" color={Colors.success} style={styles.badgeText}>
                                            ÜCRETSİZ
                                        </AppText>
                                    </View>
                                ) : (
                                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                )}
                            </View>
                            <View style={styles.cardBody}>
                                <AppText variant="h3" numberOfLines={1}>{item.title}</AppText>
                                <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2}>
                                    {item.desc}
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Random Rune Button */}
            {activeTab === 'run' && (
                <Button
                    title="Kaderine Bir Run Çektir"
                    variant="secondary"
                    onPress={handleRandomRune}
                    loading={unlocking === 'random'}
                    icon={<Ionicons name="shuffle-outline" size={18} color={Colors.textPrimary} />}
                    style={styles.randomBtn}
                />
            )}

            {/* Disclaimer — sayfa sonunda, deneyimi bölmeden */}
            <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                <AppText variant="caption" color={Colors.textMuted} style={styles.disclaimerText}>
                    Bu içerikler derleme araştırmalardan toplanmış verilerdir, eğlence amaçlıdır.
                    İçeriklerle etkileşime geçmek size arma kazandırabilir.
                </AppText>
            </View>

            {/* Detail Modal */}
            <Modal visible={!!detailItem} transparent animationType="fade" onRequestClose={() => setDetailItem(null)}>
                <View style={styles.overlay}>
                    <Card glow style={styles.modal} padded={false}>
                        {detailItem && (
                            <LinearGradient
                                colors={[detailItem.color + '40', 'transparent']}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.modalHero}
                            >
                                <View style={[styles.modalIconWrap, { backgroundColor: detailItem.color + '26', borderColor: detailItem.color + '66' }]}>
                                    <ItemSymbol item={detailItem} size={34} color={detailItem.color} />
                                </View>
                            </LinearGradient>
                        )}
                        <View style={styles.modalBody}>
                            <AppText variant="title" center>{detailItem?.title}</AppText>
                            <AppText variant="callout" center color={Colors.purpleLight} style={styles.modalSubtitle}>
                                {detailItem?.desc}
                            </AppText>
                            <View style={styles.modalDivider} />
                            <AppText variant="body" center style={styles.modalDetail}>
                                {detailItem?.detail}
                            </AppText>
                            {detailItem?.tip && (
                                <View style={styles.tipRow}>
                                    <Ionicons name="bulb-outline" size={16} color={Colors.accentYellow} />
                                    <AppText variant="callout" color={Colors.accentYellow} style={styles.tipText}>
                                        {detailItem.tip}
                                    </AppText>
                                </View>
                            )}
                            <Button title="Kapat" variant="ghost" onPress={() => setDetailItem(null)} style={styles.modalClose} />
                        </View>
                    </Card>
                </View>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    headerBlock: { marginBottom: Spacing.lg },
    headerSub: { marginTop: Spacing.xs },
    // Günün Enerjisi
    dailyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
    },
    dailyIconWrap: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },
    dailyInfo: { flex: 1, gap: 2 },
    dailyBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginBottom: 2,
    },
    dailyBadgeText: { letterSpacing: 1.2 },
    // Tabs
    segmented: {
        flexDirection: 'row', backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.pill, padding: 4, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.border,
    },
    segment: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: BorderRadius.pill, gap: 6, minHeight: 44,
    },
    segmentActive: { backgroundColor: Colors.accentYellow },
    segmentTextActive: { fontWeight: FontWeight.bold },
    sectionQuote: { marginBottom: Spacing.lg, fontStyle: 'italic' },
    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    card: {
        width: '47.5%',
        backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.lg,
        minHeight: 136,
        justifyContent: 'space-between',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    iconWrap: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },
    cardBody: { gap: 2 },
    lockBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: Colors.whiteA08, paddingHorizontal: Spacing.sm, paddingVertical: 3,
        borderRadius: BorderRadius.full,
        borderWidth: 1, borderColor: Colors.border,
    },
    freeBadge: {
        backgroundColor: 'rgba(52, 211, 153, 0.14)',
        paddingHorizontal: Spacing.sm, paddingVertical: 3,
        borderRadius: BorderRadius.full,
        borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.35)',
    },
    badgeText: { letterSpacing: 0.4 },
    randomBtn: { marginTop: Spacing.xl },
    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        padding: Spacing.md, marginTop: Spacing.xl,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.whiteA05,
    },
    disclaimerText: { flex: 1 },
    // Modal
    overlay: {
        flex: 1, backgroundColor: Colors.overlay,
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl,
    },
    modal: { width: '100%', overflow: 'hidden' },
    modalHero: { alignItems: 'center', paddingVertical: Spacing.xl },
    modalIconWrap: {
        width: 72, height: 72, borderRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },
    modalBody: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, alignItems: 'center' },
    modalSubtitle: { marginTop: 4, marginBottom: Spacing.md },
    modalDivider: { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
    modalDetail: {},
    tipRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        marginTop: Spacing.lg, paddingTop: Spacing.md,
        borderTopWidth: 1, borderTopColor: Colors.border,
    },
    tipText: { flex: 1, fontStyle: 'italic' },
    modalClose: { marginTop: Spacing.lg },
});
