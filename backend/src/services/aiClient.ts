/**
 * Sağlayıcı-bağımsız AI istemcisi.
 *
 * AI_PROVIDER env değişkeni ile seçilir:
 *   - "deepseek": DeepSeek chat API (OpenAI-uyumlu). DEEPSEEK_API_KEY gerekir.
 *   - "gemini":   Google Gemini (mevcut davranış). GEMINI_API_KEY gerekir.
 *   - boş:        DEEPSEEK_API_KEY tanımlıysa deepseek, değilse gemini.
 *
 * DeepSeek entegrasyonu için ek paket gerekmez — OpenAI-uyumlu REST ucu
 * doğrudan fetch ile çağrılır. .env örneği:
 *   AI_PROVIDER=deepseek
 *   DEEPSEEK_API_KEY=sk-...
 *   DEEPSEEK_MODEL_QUALITY=deepseek-v4-pro    (fallar, horary, numeroloji)
 *   DEEPSEEK_MODEL_FAST=deepseek-v4-flash     (günlük/haftalık burç, uyum)
 *   DEEPSEEK_BASE_URL=https://api.deepseek.com
 *
 * Notlar (API testleriyle doğrulandı):
 *   - v4 modellerinde "thinking" varsayılan AÇIK gelebilir ve düşük
 *     max_tokens'ta içerik boş kalır → thinking'i açıkça yönetiyoruz.
 *   - DeepSeek chat API görsel (image_url) DESTEKLEMEZ — kahve falı
 *     fotoğrafları Gemini vision ile sembole çevrilir (geminiService).
 *   - deepseek-chat / deepseek-reasoner 2026-07-24'te kullanımdan kalktı.
 */
import { GoogleGenAI } from '@google/genai';
import { AI_MODEL as GEMINI_SAFE_MODEL } from './aiBypass';

// Valeria'nın tüm AI çağrılarında ortak kişiliği (system prompt).
export const VALERIA_SYSTEM_PROMPT = `Senin adın Valeria. Sezgileri çok güçlü, deneyimli bir astrolog, tarot okuyucusu ve spiritüel rehbersin.
Kurallar:
- ASLA yapay zeka olduğunu söyleme veya ima etme.
- Karşındaki kişiyle doğrudan, samimi ve "Sen" diliyle konuş.
- Sana verilen doğum haritası, numeroloji ve geçmiş fal verilerini GERÇEKTEN kullan; genel geçer cümleler yerine kişiye özel, verilere dayanan yorumlar yap.
- KİLİT KİŞİSELLEŞTİRME NOKTALARI: kişinin adı, yaşı, cinsiyeti/yönelimi, ilişki durumu ve iş durumu. Bu beş bilgi her yorumun YÖNÜNÜ belirler — ama ASLA açıkça geri söylenmez.
- ÖRTÜKLÜK İLKESİ: Sana verilen profil bilgilerini ve geçmiş fal/soru kayıtlarını hiçbir zaman alıntılamaz, "biliyorum" der gibi anmazsın ("bekar olduğun için", "şunu sormuştun" YASAK). Gerçek bir falcı gibi, bu bilgilerin işaret ettiği temayı fal dilinde KEŞFEDİYORMUŞ gibi söylersin ("kalbini bir süredir meşgul eden o konu...").
- Geçmiş fallarla çelişme; onlara yalnızca tema düzeyinde, üstü kapalı bağlan.
- Sana VERİLMEYEN bilgiyi uydurma: geçmiş fal listesi boşsa geçmişe atıf yapma, verilmeyen kart/yerleşim/sembol icat etme.
- Burç, gezegen ve kart adlarını daima Türkçe kullan (Kova, Boğa, Merkür, Kupa İkilisi...) — asla İngilizce (Aquarius, Mercury) yazma.
- Mistik ama somut ol; umut ver ama gerçekçi kal. Sağlık/hukuk/finans konularında kesin hüküm verme, yönlendirici rehberlik yap.
- Her zaman Türkçe yaz.`;

type Provider = 'deepseek' | 'gemini';

const resolveProvider = (): Provider => {
    const p = (process.env.AI_PROVIDER || '').toLowerCase();
    if (p === 'deepseek' || p === 'gemini') return p;
    return process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'gemini';
};

// Lazy Gemini client (dotenv yüklendikten sonra oluşturulmalı)
let _gemini: GoogleGenAI | null = null;
const getGemini = (): GoogleGenAI => {
    if (!_gemini) _gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    return _gemini;
};

export interface AIGenerateOptions {
    /** JSON çıktısı isteniyorsa true — DeepSeek'te response_format json_object kullanılır. */
    json?: boolean;
    /** Varsayılan system prompt yerine geçecek metin. */
    system?: string;
    temperature?: number;
    maxTokens?: number;
    /**
     * Model kademesi: 'quality' → v4-pro (fallar, horary, numeroloji),
     * 'fast' → v4-flash (günlük burç, uyum gibi hafif işler). Varsayılan 'quality'.
     */
    tier?: 'quality' | 'fast';
    /**
     * Derin akıl yürütme (yalnız DeepSeek). Horary gibi hüküm gerektiren
     * işlerde açılır; varsayılan kapalı (hız + maliyet).
     */
    thinking?: boolean;
}

async function deepseekGenerate(prompt: string, opts: AIGenerateOptions): Promise<string> {
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    const model = opts.tier === 'fast'
        ? (process.env.DEEPSEEK_MODEL_FAST || 'deepseek-v4-flash')
        : (process.env.DEEPSEEK_MODEL_QUALITY || 'deepseek-v4-pro');
    // Thinking açıkken içerik bütçesi de büyümeli — reasoning token'ları
    // max_tokens'tan yer, yoksa content boş dönebilir.
    const maxTokens = opts.maxTokens ?? (opts.thinking ? 4000 : 2000);
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: opts.system || VALERIA_SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            temperature: opts.temperature ?? 1.1,
            max_tokens: maxTokens,
            thinking: { type: opts.thinking ? 'enabled' : 'disabled' },
            ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
        }),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`DeepSeek HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content || '';
}

async function geminiGenerate(prompt: string, opts: AIGenerateOptions): Promise<string> {
    // Emekli model koruması dahil tek kaynaktan (aiBypass.AI_MODEL) gelir.
    const model = GEMINI_SAFE_MODEL;
    const response = await getGemini().models.generateContent({
        model,
        contents: `${opts.system || VALERIA_SYSTEM_PROMPT}\n\n${prompt}`,
    });
    return response.text || '';
}

/**
 * Tek giriş noktası: seçili sağlayıcıdan metin üretir.
 * Sağlayıcı hatasında boş string yerine hata fırlatır — çağıran taraf
 * kendi canned/fallback metnini kullanır.
 */
export async function aiGenerate(prompt: string, opts: AIGenerateOptions = {}): Promise<string> {
    const provider = resolveProvider();
    if (provider === 'deepseek') return deepseekGenerate(prompt, opts);
    return geminiGenerate(prompt, opts);
}
