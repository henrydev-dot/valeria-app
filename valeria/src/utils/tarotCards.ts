import TAROT_DATA from '../../content/tarot_major_arcana_tr.json';

/**
 * Fal kayıtlarındaki tarot kartını görsel id'sine (0-21) çözer.
 *
 * Öncelik: sunucunun gönderdiği cardId. Eski kayıtlarda cardId yok — isimden
 * çözülür; ancak backend ile uygulama içeriği arasında yazım farkları vardı
 * ("Başrahibe" / "Baş Rahibe", "Aziz" / "Baş Rahip", "Asılan Adam" /
 * "Asılı Adam") ve birebir eşleşme bulunamayınca görsel gelmiyordu.
 * Normalizasyon (küçük harf + boşlukları at) + takma ad tablosu bunu kapatır.
 */
const norm = (s: string) => (s || '').toLocaleLowerCase('tr').replace(/\s+/g, '');

const NAME_TO_ID: Record<string, number> = {};
for (const c of TAROT_DATA as any[]) {
    NAME_TO_ID[norm(c.nameTR)] = c.id;
}
// Backend'in kullandığı alternatif yazımlar
const ALIASES: Record<string, number> = {
    'başrahibe': 2,
    'aziz': 5,
    'asılanadam': 12,
};

export function resolveTarotCardId(card: { name?: string; cardId?: number } | null | undefined): number | null {
    if (!card) return null;
    if (typeof card.cardId === 'number') return card.cardId;
    const n = norm(card.name || '');
    if (n in NAME_TO_ID) return NAME_TO_ID[n];
    if (n in ALIASES) return ALIASES[n];
    return null;
}

export function tarotNameEN(name: string): string {
    const n = norm(name);
    return (TAROT_DATA as any[]).find((c) => norm(c.nameTR) === n)?.nameEN || '';
}
