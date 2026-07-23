import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, AppText, Button, Card } from '../../src/components';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Features } from '../../src/config';

const UNLOCK_COST = 5;

// When purchases are disabled, tell users how to earn credits for free instead
// of leaving them at a dead end (no "buy credits" path exists in this build).
const EARN_HINT = Features.purchasesEnabled
    ? ''
    : ' Krediler ücretsiz kazanılıyor: profildeki günlük ödülünü al, serini sürdür ve seviye atlayarak kredi topla.';

interface DiscoverItem {
    id: string;
    title: string;
    desc: string;
    free: boolean;
    gradient: [string, string];
    detail: string;
    tip?: string;
}

// --- Data ---
const KRISTAL_ITEMS: DiscoverItem[] = [
    {
        id: 'k1', title: 'Ametist', desc: 'Huzur ve ruhsal koruma taşı', free: true, gradient: ['#7C3AED', '#4C1D95'],
        detail: 'Ametist, en güçlü koruyucu taşlardan biridir. Stresi azaltır, sezgiyi güçlendirir ve uyku kalitesini artırır. Meditasyon sırasında kullanıldığında üst çakraları açar. Yastık altına koyarak huzurlu bir uyku için kullanabilirsiniz.'
    },
    {
        id: 'k2', title: 'Pembe Kuvars', desc: 'Aşk ve şefkat enerjisi', free: false, gradient: ['#EC4899', '#831843'],
        detail: 'Pembe Kuvars, koşulsuz aşk taşıdır. Kalp çakrasını açar, öz sevgiyi ve başkalarına duyulan şefkati güçlendirir. İlişkilerde uyumu destekler ve duygusal yaraları iyileştirmeye yardımcı olur.'
    },
    {
        id: 'k3', title: 'Obsidyen', desc: 'Negatif enerji kalkanı', free: false, gradient: ['#374151', '#111827'],
        detail: 'Obsidyen, negatif enerjilere karşı güçlü bir kalkan oluşturur. Topraklama enerjisi sağlar, karanlıktaki gerçekleri ortaya çıkarır ve ruhsal koruma sağlar. Kapınızın yanına koyarak evinizi koruyabilirsiniz.'
    },
    {
        id: 'k4', title: 'Selenit', desc: 'Arındırma ve aydınlanma', free: false, gradient: ['#94A3B8', '#334155'],
        detail: 'Selenit, en yüksek titreşimli taşlardan biridir. Diğer kristalleri arındırır ve şarj eder. Mekansal temizlik için odanızda bulundurun. Taç çakrasını açar ve ruhsal aydınlanmayı destekler.'
    },
    {
        id: 'k5', title: 'Kaplan Gözü', desc: 'Cesaret ve güç taşı', free: false, gradient: ['#D97706', '#78350F'],
        detail: 'Kaplan Gözü, cesaret ve özgüven verir. Karar verme süreçlerinde netlik sağlar, kötü niyetli enerjilere karşı korur. İş hayatında başarı için cebinizde taşıyabilirsiniz.'
    },
    {
        id: 'k6', title: 'Ay Taşı', desc: 'Sezgi ve iç huzur', free: false, gradient: ['#818CF8', '#312E81'],
        detail: 'Ay Taşı, kadın enerjisini ve sezgisel yetenekleri güçlendirir. Ay döngüsüyle uyum sağlar, duygusal dengeyi destekler. Yeni ay dönemlerinde şarj ederek en yüksek etkiyi alabilirsiniz.'
    },
];

const RUN_ITEMS: DiscoverItem[] = [
    {
        id: 'r1', title: 'Fehu ᚠ', desc: 'Refah ve bolluk runu', free: true, gradient: ['#F59E0B', '#92400E'],
        detail: 'Fehu, maddi bolluk ve refahın sembolüdür. Cüzdanınıza veya iş yerinize çizerek finansal bereket çağırabilirsiniz. Yeni başlangıçlar ve yatırımlar için ideal bir rundur.', tip: 'Cüzdanınıza çizin, maddi bereket için'
    },
    {
        id: 'r2', title: 'Algiz ᛉ', desc: 'Koruma ve savunma', free: true, gradient: ['#10B981', '#064E3B'],
        detail: 'Algiz, en güçlü koruma runudur. Kötü enerjilere, nazara ve olumsuz etkilere karşı kalkan oluşturur. Kapılarınıza veya pencerelere çizerek evinizi koruyabilirsiniz.', tip: 'Kapınıza çizin, kötü enerjilere karşı'
    },
    {
        id: 'r3', title: 'Ansuz ᚨ', desc: 'Bilgelik ve iletişim', free: false, gradient: ['#3B82F6', '#1E3A5F'],
        detail: 'Ansuz, ilahi bilgelik ve iletişim runudur. Doğru kararlara ulaşmanızı sağlar. Önemli görüşmeler öncesi bileğinize çizebilirsiniz.', tip: 'Bileğinize çizin, doğru kararlar için'
    },
    {
        id: 'r4', title: 'Raidho ᚱ', desc: 'Yolculuk ve hareket', free: false, gradient: ['#8B5CF6', '#4C1D95'],
        detail: 'Raidho, güvenli yolculuk ve doğru yolu bulma runudur. Fiziksel ve ruhsal yolculuklarda rehberlik eder.', tip: 'Ayakkabınıza çizin, güvenli yolculuk için'
    },
    {
        id: 'r5', title: 'Sowilo ᛊ', desc: 'Güneş enerjisi ve başarı', free: false, gradient: ['#EF4444', '#7F1D1D'],
        detail: 'Sowilo, güneş enerjisi taşıyan zafer runudur. Başarı, sağlık ve yaşam gücü verir. Avucunuza çizerek güne enerjik başlayın.', tip: 'Avucunuza çizin, motivasyon için'
    },
    {
        id: 'r6', title: 'Wunjo ᚹ', desc: 'Mutluluk ve harmoni', free: false, gradient: ['#EC4899', '#831843'],
        detail: 'Wunjo, mutluluk, şifa ve iç huzur runudur. İlişkilerde uyumu ve hayattan zevk almayı destekler. Yastık altına çizerek huzurlu uyku için kullanın.', tip: 'Yastık altına çizin, huzurlu uyku için'
    },
];

const RITUAL_ITEMS: DiscoverItem[] = [
    {
        id: 'rt1', title: 'Yeni Ay Ritüeli', desc: 'Yeni başlangıçlar ve niyet belirleme', free: true, gradient: ['#6366F1', '#312E81'],
        detail: 'Yeni ay, niyet koyma ve yeni başlangıçlar için en güçlü zamandır. Sessiz bir ortamda oturun, niyetlerinizi kağıda yazın, bir mum yakın ve evrenle paylaşın. 3 gün boyunca niyetlerinizi tekrarlayın.'
    },
    {
        id: 'rt2', title: 'Dolunay Ritüeli', desc: 'Bırakma ve arındırma', free: false, gradient: ['#F59E0B', '#92400E'],
        detail: 'Dolunay, artık size hizmet etmeyen şeyleri bırakma zamanıdır. Bırakmak istediklerinizi kağıda yazın, güvenli bir şekilde yakın. Ay ışığında meditasyon yapın ve arının.'
    },
    {
        id: 'rt3', title: 'Sabah Meditasyonu', desc: 'Güne pozitif enerji ile başla', free: false, gradient: ['#F97316', '#7C2D12'],
        detail: '5 dakika sessizce oturun, nefes alın. Gününüz için pozitif niyetlerinizi belirleyin. Minnettarlık listenizi zihninizde gözden geçirin. Her gün tekrarlayarak alışkanlık haline getirin.'
    },
    {
        id: 'rt4', title: 'Tuz Banyosu', desc: 'Enerji temizleme ritüeli', free: false, gradient: ['#14B8A6', '#134E4A'],
        detail: 'Banyo suyuna bir avuç deniz tuzu ve birkaç damla lavanta yağı ekleyin. 20 dakika bekleyin ve negatif enerjilerin suda eridiğini hayal edin. Haftada bir uygulayın.'
    },
    {
        id: 'rt5', title: 'Mum Ritüeli', desc: 'Niyet gücünü artırma', free: false, gradient: ['#EF4444', '#7F1D1D'],
        detail: 'Niyetinize uygun renkte bir mum seçin (yeşil: bereket, kırmızı: aşk, beyaz: arındırma). Mumu yakarken niyetinizi tekrarlayın. Mum kendi kendine sönene kadar yakın.'
    },
    {
        id: 'rt6', title: 'Kristal Şarj Ritüeli', desc: 'Kristallerinizi ay ışığında şarj edin', free: false, gradient: ['#A78BFA', '#4C1D95'],
        detail: 'Dolunay gecesi kristallerinizi pencere kenarına veya dışarıya yerleştirin. Sabaha kadar ay ışığında bırakın. Kristaller arınır ve yeniden enerjiyle dolar. Ayda bir tekrarlayın.'
    },
];

type TabKey = 'kristal' | 'run' | 'ritual';

export default function DiscoverScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('kristal');
    const [detailItem, setDetailItem] = useState<DiscoverItem | null>(null);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const spendCredits = useEntitlementsStore((s) => s.spendCredits);
    const earnXP = useEntitlementsStore((s) => s.earnXP);
    // Persisted, DB-backed unlocks survive restarts (aligned with home screen)
    const unlockedContentIds = useEntitlementsStore((s) => s.unlockedContentIds);

    const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: 'kristal', label: 'Kristaller', icon: 'diamond-outline' },
        { key: 'run', label: 'Runler', icon: 'grid-outline' },
        { key: 'ritual', label: 'Ritüeller', icon: 'moon-outline' },
    ];

    const getItems = (): DiscoverItem[] => {
        if (activeTab === 'kristal') return KRISTAL_ITEMS;
        if (activeTab === 'run') return RUN_ITEMS;
        return RITUAL_ITEMS;
    };

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
            <AppText variant="hero" style={styles.title}>Keşfet</AppText>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <AppText variant="caption" style={styles.disclaimerText}>
                    Bu içerikler derleme araştırmalardan toplanmış verilerdir, eğlence amaçlıdır. İçeriklerle etkileşime geçmek size arma kazandırabilir.
                </AppText>
            </View>

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
                            <Ionicons name={tab.icon} size={18}
                                color={active ? Colors.accentYellow : Colors.textMuted} />
                            <AppText variant="callout" color={active ? Colors.accentYellow : Colors.textMuted}>
                                {tab.label}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Section description */}
            {activeTab === 'kristal' && (
                <AppText variant="body" style={styles.sectionDesc}>
                    Her kristalin kendine özgü bir enerjisi vardır. Detayları görmek için dokunun.
                </AppText>
            )}
            {activeTab === 'run' && (
                <AppText variant="body" style={styles.sectionDesc}>
                    Runleri çizip üzerinizde taşıyarak enerji verebilirsiniz. İlk 2 run ücretsiz.
                </AppText>
            )}
            {activeTab === 'ritual' && (
                <AppText variant="body" style={styles.sectionDesc}>
                    Ritüeller niyetinizi güçlendirir. İlk ritüel ücretsiz, diğerlerini kredi ile açınız.
                </AppText>
            )}

            {/* Content Grid */}
            <View style={styles.grid}>
                {getItems().map((item) => {
                    const unlocked = isUnlocked(item);
                    const busy = unlocking === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.cardWrap}
                            activeOpacity={0.8}
                            disabled={busy}
                            onPress={() => handlePress(item)}
                            accessibilityRole="button"
                            accessibilityLabel={
                                unlocked
                                    ? `${item.title} — detayları gör`
                                    : `${item.title} — ${UNLOCK_COST} kredi ile aç`
                            }
                        >
                            <LinearGradient
                                colors={item.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.card, !unlocked && styles.cardLocked]}
                            >
                                <AppText variant="h3" color={Colors.textPrimary} style={styles.cardTitle}>
                                    {item.title}
                                </AppText>
                                <AppText variant="caption" color={Colors.textPrimary} style={styles.cardDesc}>
                                    {item.desc}
                                </AppText>
                                {!unlocked && (
                                    <View style={styles.lockBadge}>
                                        <Ionicons name="lock-closed" size={10} color={Colors.textPrimary} />
                                        <AppText variant="label" color={Colors.textPrimary} style={styles.lockText}>
                                            {UNLOCK_COST} kredi
                                        </AppText>
                                    </View>
                                )}
                                {unlocked && !item.free && (
                                    <View style={styles.unlockedBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                    </View>
                                )}
                                {item.free && (
                                    <View style={styles.freeBadge}>
                                        <AppText variant="label" color={Colors.textOnAccent} style={styles.freeText}>
                                            ÜCRETSİZ
                                        </AppText>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Random Rune Button */}
            {activeTab === 'run' && (
                <Button
                    title="Rastgele Run Aç"
                    variant="secondary"
                    onPress={handleRandomRune}
                    loading={unlocking === 'random'}
                    icon={<Ionicons name="shuffle-outline" size={18} color={Colors.textPrimary} />}
                    style={styles.randomBtn}
                />
            )}

            {/* Detail Modal */}
            <Modal visible={!!detailItem} transparent animationType="fade" onRequestClose={() => setDetailItem(null)}>
                <View style={styles.overlay}>
                    <Card glow style={styles.modal}>
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
                    </Card>
                </View>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    title: { marginBottom: Spacing.md },
    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        backgroundColor: Colors.purpleA15, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.xl,
        borderLeftWidth: 3, borderLeftColor: Colors.borderAccent,
    },
    disclaimerText: { flex: 1 },
    segmented: {
        flexDirection: 'row', backgroundColor: Colors.surface1,
        borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: Colors.border,
    },
    segment: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: 6, minHeight: 44,
    },
    segmentActive: { backgroundColor: Colors.surface3 },
    sectionDesc: { marginBottom: Spacing.lg },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    cardWrap: { width: '47%', borderRadius: BorderRadius.lg, overflow: 'hidden' },
    card: {
        padding: Spacing.lg, borderRadius: BorderRadius.lg, minHeight: 110,
        justifyContent: 'flex-end', position: 'relative',
    },
    cardLocked: { opacity: 0.7 },
    cardTitle: { marginBottom: 4 },
    cardDesc: { opacity: 0.85 },
    lockBadge: {
        position: 'absolute', top: 8, right: 8,
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: Colors.overlay, paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    lockText: { letterSpacing: 0 },
    unlockedBadge: { position: 'absolute', top: 8, right: 8 },
    freeBadge: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    freeText: { letterSpacing: 0 },
    randomBtn: { marginTop: Spacing.xl },
    // Modal
    overlay: {
        flex: 1, backgroundColor: Colors.overlay,
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl,
    },
    modal: { width: '100%', alignItems: 'center' },
    modalSubtitle: { marginTop: 4, marginBottom: Spacing.md },
    modalDivider: { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
    modalDetail: {},
    tipRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        marginTop: Spacing.lg, paddingTop: Spacing.md,
        borderTopWidth: 1, borderTopColor: Colors.border,
    },
    tipText: { flex: 1, fontStyle: 'italic' },
    modalClose: { marginTop: Spacing.xl },
});
