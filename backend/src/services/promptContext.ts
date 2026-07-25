/**
 * AI prompt'ları için ortak bağlam üreticileri.
 *
 * Amaç: Valeria'nın her yorumu (horary, tarot, kahve, numeroloji, günlük)
 * kişinin GERÇEK doğum haritasına ve GEÇMİŞ fallarına otursun; yorumlar
 * arasında anlam bütünlüğü olsun.
 */
import { Reading } from '../models/Reading';

/** Kayıtlı kullanıcı alanlarından kısa natal kimlik bloğu. */
export function buildNatalBlock(user: {
    name?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    element?: string;
    gender?: string;
    relationshipStatus?: string;
    workStatus?: string;
    birthDate?: string;
    deityName?: string;
}): string {
    const lines: string[] = [];
    if (user.name) lines.push(`Ad: ${user.name}`);
    if (user.birthDate) lines.push(`Doğum tarihi: ${user.birthDate}`);
    const trio = [
        user.sunSign ? `Güneş ${user.sunSign}` : null,
        user.moonSign ? `Ay ${user.moonSign}` : null,
        user.risingSign ? `Yükselen ${user.risingSign}` : null,
        user.element ? `Element ${user.element}` : null,
    ].filter(Boolean);
    if (trio.length) lines.push(`Doğum haritası: ${trio.join(', ')}`);
    if (user.deityName) lines.push(`Tanrı arketipi: ${user.deityName}`);
    if (user.gender) lines.push(`Cinsiyet/Yönelim: ${user.gender}`);
    if (user.relationshipStatus) lines.push(`İlişki durumu: ${user.relationshipStatus}`);
    if (user.workStatus) lines.push(`İş durumu: ${user.workStatus}`);
    return lines.join('\n');
}

const clip = (s: string, n: number) => (s && s.length > n ? s.slice(0, n).trimEnd() + '…' : s || '');

/**
 * Kişinin son fallarının özet bloğu. Tarot çekimlerinde çıkan kartlar
 * (düz/ters) açıkça listelenir ki yeni yorumlar onlara atıf yapabilsin.
 */
export async function buildHistoryBlock(userId: string, limit = 5): Promise<string> {
    try {
        const readings = await Reading.find({ userId: String(userId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        if (!readings.length) return '';

        const items = readings.map((r: any) => {
            const when = new Date(r.date || r.createdAt).toLocaleDateString('tr-TR');
            if (r.type === 'tarot' && Array.isArray(r.cards) && r.cards.length) {
                const cards = r.cards
                    .map((c: any) => `${c?.card?.nameTR || '?'} (${c?.isReversed ? 'ters' : 'düz'})`)
                    .join(', ');
                const q = r.question ? ` Soru: "${clip(r.question, 80)}".` : '';
                const synth = r.result ? ` Sentez: ${clip(String(r.result), 140)}` : '';
                return `- [${when}] Tarot: ${cards}.${q}${synth}`;
            }
            if (r.type === 'coffee') {
                return `- [${when}] Kahve falı.${r.question ? ` Soru: "${clip(r.question, 80)}".` : ''} Özet: ${clip(String(r.result || ''), 160)}`;
            }
            if (r.type === 'question') {
                return `- [${when}] Yıldızlara soru: "${clip(r.question, 100)}" → Verilen yanıt özeti: ${clip(String(r.answer || ''), 160)}`;
            }
            return `- [${when}] ${r.type} falı.`;
        });

        return `GEÇMİŞ FALLAR (en yeniden eskiye — yorumlarında bunlarla anlam bütünlüğü kur, gerektiğinde atıf yap):\n${items.join('\n')}`;
    } catch {
        // Geçmiş yüklenemezse bağlamsız devam et — yorum yine üretilir.
        return '';
    }
}
