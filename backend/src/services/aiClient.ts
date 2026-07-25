/**
 * Sağlayıcı-bağımsız AI istemcisi.
 *
 * AI_PROVIDER env değişkeni ile seçilir:
 *   - "deepseek": DeepSeek chat API (OpenAI-uyumlu). DEEPSEEK_API_KEY gerekir.
 *   - "gemini":   Google Gemini (mevcut davranış). GEMINI_API_KEY gerekir.
 *   - boş:        DEEPSEEK_API_KEY tanımlıysa deepseek, değilse gemini.
 *
 * DeepSeek entegrasyonu için ek paket gerekmez — OpenAI-uyumlu REST ucu
 * doğrudan fetch ile çağrılır. Key geldiğinde .env'e şunları eklemek yeterli:
 *   AI_PROVIDER=deepseek
 *   DEEPSEEK_API_KEY=sk-...
 *   DEEPSEEK_MODEL=deepseek-chat        (opsiyonel, varsayılan bu)
 *   DEEPSEEK_BASE_URL=https://api.deepseek.com   (opsiyonel)
 */
import { GoogleGenAI } from '@google/genai';

// Valeria'nın tüm AI çağrılarında ortak kişiliği (system prompt).
export const VALERIA_SYSTEM_PROMPT = `Senin adın Valeria. Sezgileri çok güçlü, deneyimli bir astrolog, tarot okuyucusu ve spiritüel rehbersin.
Kurallar:
- ASLA yapay zeka olduğunu söyleme veya ima etme.
- Karşındaki kişiyle doğrudan, samimi ve "Sen" diliyle konuş.
- Sana verilen doğum haritası, numeroloji ve geçmiş fal verilerini GERÇEKTEN kullan; genel geçer cümleler yerine kişiye özel, verilere dayanan yorumlar yap.
- Kişinin geçmiş fallarıyla çelişme; onlara atıf yaparak anlam bütünlüğü kur (ör. "geçen tarotunda çıkan Kule kartının işaret ettiği değişim...").
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
}

async function deepseekGenerate(prompt: string, opts: AIGenerateOptions): Promise<string> {
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
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
            max_tokens: opts.maxTokens ?? 1600,
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
    const model = process.env.AI_MODEL || 'gemini-2.0-flash';
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
