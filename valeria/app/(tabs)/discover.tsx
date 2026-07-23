import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground, KismetCard, PrimaryButton } from '../../src/components';
import { useEntitlementsStore } from '../../src/stores/useEntitlementsStore';
import { Colors } from '../../src/theme/colors';
import { FontSize, Spacing, BorderRadius } from '../../src/theme/spacing';

// --- Data ---
const KRISTAL_ITEMS = [
    {
        id: 'k1', title: 'Ametist', desc: 'Huzur ve ruhsal koruma taşı', free: true, gradient: ['#7C3AED', '#4C1D95'],
        detail: 'Ametist, en güçlü koruyucu taşlardan biridir. Stresi azaltır, sezgiyi güçlendirir ve uyku kalitesini artırır. Meditasyon sırasında kullanıldığında üst çakraları açar. Yastık altına koyarak huzurlu bir uyku için kullanabilirsiniz.'
    },
    {
        id: 'k2', title: 'Pembe Kuvars', desc: 'Aşk ve şefkat enerjisi', free: false, gradient: ['#EC4899', '#831843'],
        detail: 'Pembe Kuvars, koşulsuz aşk taşıdır. Kalp çakrasını açar, özsevgiyi ve başkalarına duyulan şefkati güçlendirir. İlişkilerde uyumu destekler ve duygusal yaraları iyileştirmeye yardımcı olur.'
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

const RUN_ITEMS = [
    {
        id: 'r1', title: 'Fehu ᚠ', desc: 'Refah ve bolluk runu', free: true, gradient: ['#F59E0B', '#92400E'],
        detail: 'Fehu, maddi bolluk ve refahın sembolüdür. Cüzdanınıza veya iş yerinize çizerek finansal bereket çağırabilirsiniz. Yeni başlangıçlar ve yatırımlar için ideal bir rundur.', tip: 'Cüzdanınıza çizin, maddi bereket için'
    },
    {
        id: 'r2', title: 'Algiz ᛉ', desc: 'Koruma ve savunma', free: true, gradient: ['#10B981', '#064E3B'],
        detail: 'Algiz, en güçlü koruma runudur. Kötü enerjilere, nazara ve olumsuz etkilere karşı kalkan oluşturur. Kapılarınıza veya pencerelere çizerek evinizi koruyabilirsiniz.', tip: 'Kapınıza çizin, kötü enerjilere karşı'
    },
    {
        id: 'r3', title: 'Ansuz ᚨ', desc: 'Bilgelik ve iletisim', free: false, gradient: ['#3B82F6', '#1E3A5F'],
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
        detail: 'Wunjo, mutluluk, şefa ve iç huzur runudur. İlişkilerde uyumu ve hayattan zevk almayı destekler. Yastık altına çizerek huzurlu uyku için kullanın.', tip: 'Yastık altına çizin, huzurlu uyku için'
    },
];

const RITUAL_ITEMS = [
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
        id: 'rt5', title: 'Mum Ritueli', desc: 'Niyet gucunu artirma', free: false, gradient: ['#EF4444', '#7F1D1D'],
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
    const [detailItem, setDetailItem] = useState<any>(null);
    const { spendCredits, earnXP } = useEntitlementsStore();
    const credits = useEntitlementsStore((s) => s.credits);
    const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

    const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: 'kristal', label: 'Kristaller', icon: 'diamond-outline' },
        { key: 'run', label: 'Runler', icon: 'grid-outline' },
        { key: 'ritual', label: 'Ritueller', icon: 'moon-outline' },
    ];

    const getItems = () => {
        if (activeTab === 'kristal') return KRISTAL_ITEMS;
        if (activeTab === 'run') return RUN_ITEMS;
        return RITUAL_ITEMS;
    };

    const isUnlocked = (item: any) => item.free || unlockedIds.has(item.id);

    const handlePress = (item: any) => {
        if (isUnlocked(item)) {
            setDetailItem(item);
            earnXP(5);
        } else {
            // Unlock with 5 credits
            if (spendCredits(5)) {
                setUnlockedIds((prev) => new Set(prev).add(item.id));
                setDetailItem(item);
                earnXP(10);
            } else {
                Alert.alert('Yetersiz Kredi', 'Bu içeriği açmak için 5 kredi gerekiyor.');
            }
        }
    };

    const handleRandomRune = () => {
        const locked = RUN_ITEMS.filter((r) => !r.free && !unlockedIds.has(r.id));
        if (locked.length === 0) {
            Alert.alert('Tüm Runler Açık', 'Tüm runleri zaten açtınız!');
            return;
        }
        if (spendCredits(5)) {
            const pick = locked[Math.floor(Math.random() * locked.length)];
            setUnlockedIds((prev) => new Set(prev).add(pick.id));
            setDetailItem(pick);
            earnXP(10);
        } else {
            Alert.alert('Yetersiz Kredi', 'Rastgele run açmak için 5 kredi gerekiyor.');
        }
    };

    return (
        <GradientBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Keşfet</Text>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.disclaimerText}>
                        Bu içerikler derleme araştırmalardan toplanmış verilerdir, eğlence amaçlıdır. İçeriklerle etkileşime geçmek size arma kazandırabilir.
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.segmented}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons name={tab.icon} size={18}
                                color={activeTab === tab.key ? Colors.accentYellow : Colors.textMuted} />
                            <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section description */}
                {activeTab === 'kristal' && (
                    <Text style={styles.sectionDesc}>
                        Her kristalin kendine özgü bir enerjisi vardır. Detayları görmek için dokunun.
                    </Text>
                )}
                {activeTab === 'run' && (
                    <Text style={styles.sectionDesc}>
                        Runleri çizip üzerinizde taşıyarak enerji verebilirsiniz. İlk 2 run ücretsiz.
                    </Text>
                )}
                {activeTab === 'ritual' && (
                    <Text style={styles.sectionDesc}>
                        Ritüeller niyetinizi güçlendirir. İlk ritüel ücretsiz, diğerlerini kredi ile açınız.
                    </Text>
                )}

                {/* Content Grid */}
                <View style={styles.grid}>
                    {getItems().map((item) => {
                        const unlocked = isUnlocked(item);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.cardWrap}
                                activeOpacity={0.8}
                                onPress={() => handlePress(item)}
                            >
                                <LinearGradient
                                    colors={item.gradient as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[styles.card, !unlocked && styles.cardLocked]}
                                >
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardDesc}>{item.desc}</Text>
                                    {!unlocked && (
                                        <View style={styles.lockBadge}>
                                            <Ionicons name="lock-closed" size={10} color="#fff" />
                                            <Text style={styles.lockText}>5 kredi</Text>
                                        </View>
                                    )}
                                    {unlocked && !item.free && (
                                        <View style={styles.unlockedBadge}>
                                            <Ionicons name="checkmark-circle" size={10} color="#34D399" />
                                        </View>
                                    )}
                                    {item.free && (
                                        <View style={styles.freeBadge}>
                                            <Text style={styles.freeText}>ÜCRETSİZ</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Random Rune Button */}
                {activeTab === 'run' && (
                    <TouchableOpacity style={styles.randomBtn} activeOpacity={0.8} onPress={handleRandomRune}>
                        <Ionicons name="shuffle-outline" size={18} color={Colors.accentYellow} />
                        <Text style={styles.randomText}>Rastgele Run Aç</Text>
                        <Text style={styles.randomCost}>5 kredi</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={!!detailItem} transparent animationType="fade" onRequestClose={() => setDetailItem(null)}>
                <View style={styles.overlay}>
                    <KismetCard glow style={styles.modal}>
                        <Text style={styles.modalTitle}>{detailItem?.title}</Text>
                        <Text style={styles.modalSubtitle}>{detailItem?.desc}</Text>
                        <View style={styles.modalDivider} />
                        <Text style={styles.modalDetail}>{detailItem?.detail}</Text>
                        {detailItem?.tip && (
                            <View style={styles.tipRow}>
                                <Ionicons name="bulb-outline" size={14} color={Colors.accentYellow} />
                                <Text style={styles.tipText}>{detailItem.tip}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.modalClose} onPress={() => setDetailItem(null)}>
                            <Text style={styles.modalCloseText}>Kapat</Text>
                        </TouchableOpacity>
                    </KismetCard>
                </View>
            </Modal>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },
    title: { fontSize: FontSize.hero, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        backgroundColor: Colors.purple + '15', borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.xl,
        borderLeftWidth: 3, borderLeftColor: Colors.accentYellow + '60',
    },
    disclaimerText: { flex: 1, fontSize: 11, color: Colors.textMuted, lineHeight: 16 },
    segmented: {
        flexDirection: 'row', backgroundColor: Colors.backgroundCard,
        borderRadius: BorderRadius.lg, padding: 4, marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: Colors.border,
    },
    segment: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: 6,
    },
    segmentActive: { backgroundColor: Colors.backgroundCardLight },
    segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
    segmentTextActive: { color: Colors.accentYellow },
    sectionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    cardWrap: { width: '47%', borderRadius: BorderRadius.lg, overflow: 'hidden' },
    card: {
        padding: Spacing.lg, borderRadius: BorderRadius.lg, minHeight: 110,
        justifyContent: 'flex-end', position: 'relative',
    },
    cardLocked: { opacity: 0.7 },
    cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#fff', marginBottom: 4 },
    cardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 15 },
    lockBadge: {
        position: 'absolute', top: 8, right: 8,
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    lockText: { fontSize: 9, color: '#fff', fontWeight: '600' },
    unlockedBadge: { position: 'absolute', top: 8, right: 8 },
    freeBadge: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: '#34D399', paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    freeText: { fontSize: 8, fontWeight: '700', color: '#000' },
    randomBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, marginTop: Spacing.xl,
        backgroundColor: Colors.purple + '25', borderWidth: 1, borderColor: Colors.accentYellow + '30',
        borderRadius: BorderRadius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    },
    randomText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.accentYellow },
    randomCost: { fontSize: 11, color: Colors.textMuted },
    // Modal
    overlay: {
        flex: 1, backgroundColor: Colors.overlay,
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl,
    },
    modal: { width: '100%', alignItems: 'center' },
    modalTitle: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
    modalSubtitle: { fontSize: FontSize.sm, color: Colors.purpleLight, marginBottom: Spacing.md },
    modalDivider: { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
    modalDetail: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
    tipRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        marginTop: Spacing.lg, paddingTop: Spacing.md,
        borderTopWidth: 1, borderTopColor: Colors.border,
    },
    tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.accentYellow, fontStyle: 'italic', lineHeight: 20 },
    modalClose: { marginTop: Spacing.xl },
    modalCloseText: { fontSize: FontSize.md, color: Colors.textMuted, fontWeight: '500' },
});
