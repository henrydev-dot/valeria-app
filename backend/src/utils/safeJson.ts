/**
 * AI çıktılarından JSON ayrıştırma — modeller zaman zaman bozuk JSON üretir
 * (sondaki virgül, kod bloğu çiti, metin araya karışması, tırnak içinde çıplak
 * satır sonu). Çıplak JSON.parse tek karakterde patlayıp falı şablon metne
 * düşürüyordu; bu yardımcı sık hataları onarıp birkaç aşamada dener.
 */
export function safeJsonParse<T = any>(raw: string): T {
    if (!raw) throw new Error('Boş JSON metni');

    let text = raw.trim();

    // 1) Kod bloğu çitlerini soy: ```json ... ``` veya ``` ... ```
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

    // 2) İlk { (veya [) ile son } (veya ]) arasını al — modelin başa/sona
    //    eklediği açıklama cümlelerini atar.
    const firstBrace = text.search(/[{[]/);
    if (firstBrace > 0) text = text.slice(firstBrace);
    const lastObj = text.lastIndexOf('}');
    const lastArr = text.lastIndexOf(']');
    const last = Math.max(lastObj, lastArr);
    if (last >= 0 && last < text.length - 1) text = text.slice(0, last + 1);

    const attempts: Array<(s: string) => string> = [
        (s) => s,
        // 3) Sondaki virgüller: {"a":1,} / [1,2,] → geçerli JSON
        (s) => s.replace(/,\s*([}\]])/g, '$1'),
        // 4) Çift virgül + sondaki virgüller
        (s) => s.replace(/,\s*,+/g, ',').replace(/,\s*([}\]])/g, '$1'),
        // 5) Tırnak içindeki çıplak satır sonlarını \n olarak kaçır
        (s) => escapeNewlinesInStrings(s).replace(/,\s*,+/g, ',').replace(/,\s*([}\]])/g, '$1'),
    ];

    let lastError: unknown;
    for (const fix of attempts) {
        try {
            return JSON.parse(fix(text)) as T;
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError instanceof Error ? lastError : new Error('JSON ayrıştırılamadı');
}

/** Çift tırnaklı string içindeki gerçek satır sonlarını \n kaçışına çevirir. */
function escapeNewlinesInStrings(s: string): string {
    let out = '';
    let inString = false;
    let escaped = false;
    for (const ch of s) {
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === '"') {
                inString = false;
            } else if (ch === '\n') {
                out += '\\n';
                continue;
            } else if (ch === '\r') {
                continue;
            }
        } else if (ch === '"') {
            inString = true;
        }
        out += ch;
    }
    return out;
}
