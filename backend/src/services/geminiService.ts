import { GoogleGenAI } from '@google/genai';
import { AnalysisResult, NumerologyData, PlanetPosition, TransitData, UserInput } from '../types';
import { aiGenerate } from './aiClient';
import { buildNatalBlock, buildHistoryBlock } from './promptContext';
import { ZODIAC_DATA } from '../constants';
import {
    AI_BYPASS,
    AI_MODEL,
    cannedInterpretation,
    cannedHorary,
    cannedTarot,
    cannedCoffee,
    cannedDailyHoroscope,
    cannedWeeklyHoroscope,
    cannedCompatibility,
    cannedDailyTarotMessage,
    cannedNumerology,
} from './aiBypass';

// Lazy-initialize Gemini Client (dotenv must load before this is called)
let _ai: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
    if (!_ai) {
        _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    }
    return _ai;
};

// ==================== FULL ANALYSIS INTERPRETATION ====================
export const generateInterpretation = async (
    inputData: UserInput,
    astrology: { sun: PlanetPosition; moon: PlanetPosition; rising: PlanetPosition },
    numerology: NumerologyData
): Promise<AnalysisResult['aiInterpretation']> => {
    if (AI_BYPASS) return cannedInterpretation(inputData.name, astrology.sun.sign, astrology.moon.sign, astrology.rising.sign, numerology.lifePath);

    const sunData = ZODIAC_DATA[astrology.sun.sign];
    const moonData = ZODIAC_DATA[astrology.moon.sign];
    const risingData = ZODIAC_DATA[astrology.rising.sign];

    const prompt = `
    Senin adın Valeria. Sezgileri çok güçlü, profesyonel bir astrolog ve spiritüel rehbersin. ASLA yapay zeka olduğunu söyleme.
    Aşağıdaki verilere göre bir analiz yap. Yorumunda samimi ve "Sen" diliyle hitap et.
    
    KULLANICI:
    - Ad: ${inputData.name}
    - Kimlik/Yönelim: ${inputData.gender}
    - İlişki Durumu: ${inputData.relationshipStatus}
    - İş Durumu: ${inputData.jobStatus}

    HARİTA ÖZETİ:
    - Güneş: ${astrology.sun.sign}
    - Ay: ${astrology.moon.sign}
    - Yükselen: ${astrology.rising.sign}
    - Yaşam Yolu Sayısı: ${numerology.lifePath}

    GÖREV:
    Aşağıdaki JSON formatını EKSİKSİZ doldur. Markdown kullanma, sadece saf JSON ver.
    
    {
      "personalitySummary": "Kişinin karakterinin 2-3 cümlelik özeti.",
      "detailedAnalysis": "Kişiye 'Sen' diliyle hitap eden, iş (${inputData.jobStatus}) ve ilişki (${inputData.relationshipStatus}) durumunu analiz eden, motive edici 3 paragraflık derin analiz.",
      "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
      "challenges": ["Zayıf yön 1", "Zayıf yön 2", "Zayıf yön 3"],
      "prediction": "Önümüzdeki 7 gün için 1 cümlelik astrolojik öngörü.",
      "relationshipAnalysis": {
        "mistakes": "İlişkilerde yaptığı en büyük hata nedir?",
        "idealPartner": "${inputData.gender} yönelimine göre ideal partner nasıl biri olmalı?",
        "attractionDynamics": "Bu kişinin aurası ne tür enerjileri çekiyor?"
      }
    }
  `;

    try {
        const responseText = await aiGenerate(prompt, { json: true, tier: 'quality' });

        if (responseText) {
            let cleanText = responseText.trim();
            if (cleanText.startsWith("```json")) {
                cleanText = cleanText.slice(7);
            } else if (cleanText.startsWith("```")) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith("```")) {
                cleanText = cleanText.slice(0, -3);
            }

            const rawData = JSON.parse(cleanText);

            return {
                personalitySummary: rawData.personalitySummary || `${astrology.sun.sign} burcunun ışıltısı ve ${astrology.rising.sign} burcunun duruşuyla etkileyici bir auranız var.`,
                detailedAnalysis: rawData.detailedAnalysis || "Yıldızlar şu an sizin için derin bir dönüşüm sürecine işaret ediyor. İç dünyanızdaki potansiyeli dışarı vurma zamanı.",
                strengths: rawData.strengths?.length > 0 ? rawData.strengths : ["Dayanıklılık", "Sezgi", "Yaratıcılık"],
                challenges: rawData.challenges?.length > 0 ? rawData.challenges : ["Sabırsızlık", "Aşırı Düşünme", "İçe Kapanma"],
                prediction: rawData.prediction || "Bu hafta sürpriz karşılaşmalara açık olun.",
                relationshipAnalysis: {
                    mistakes: rawData.relationshipAnalysis?.mistakes || "Duygularınızı bazen çok hızlı açıyor, bazen de duvarlar örüyorsunuz.",
                    idealPartner: rawData.relationshipAnalysis?.idealPartner || "Sizi ruhsal olarak besleyecek ve zihinsel derinliğinize eşlik edecek biri.",
                    attractionDynamics: rawData.relationshipAnalysis?.attractionDynamics || "Tutkulu ve gizemli enerjileri kendinize çekiyorsunuz."
                }
            };
        } else {
            throw new Error("Boş yanıt");
        }
    } catch (error) {
        console.error("AI Error, using fallback:", error);
        return {
            personalitySummary: "Gezegenlerin dansı, karmaşık ama güçlü bir karaktere sahip olduğunuzu gösteriyor.",
            detailedAnalysis: "Analiz sırasında kozmik bir yoğunluk yaşandı, ancak haritanız gösteriyor ki şu an hayatınızda önemli bir geçiş evresindesiniz. Güneşiniz size yaşam enerjisi verirken, Ay burcunuz duygusal ihtiyaçlarınızı belirliyor.",
            strengths: ["Azim", "Analitik Zeka", "Tutku"],
            challenges: ["Esneklik", "Affetme", "Güven Sorunu"],
            prediction: "Yıldızlar bu hafta iç sesinizi dinlemeniz gerektiğini fısıldıyor.",
            relationshipAnalysis: {
                mistakes: "Geçmiş kalıpları tekrar etme eğilimi.",
                idealPartner: "Size güven verecek sadık bir partner.",
                attractionDynamics: "Duygusal derinliği olan bağlar."
            }
        };
    }
};

// ==================== HORARY QUESTION ====================
export interface HoraryAnswer {
    /** Soruya tek cümlelik NET cevap (Evet/Hayır/Koşullu). */
    verdict: string;
    /** En fazla 3-4 cümlelik kısa astrolojik yorum. */
    comment: string;
}

export const askHoraryQuestion = async (
    question: string,
    transits: TransitData[],
    currentPlanets: PlanetPosition[],
    userContext: UserInput,
    natal?: { sun?: PlanetPosition; moon?: PlanetPosition; rising?: PlanetPosition },
    historyBlock?: string
): Promise<HoraryAnswer> => {
    if (AI_BYPASS) return { verdict: cannedHorary(question, userContext.name), comment: '' };
    const today = new Date().toISOString().split('T')[0];

    // Natal harita özeti — horary yorumu kişinin gerçek haritasına oturur.
    const natalLine = natal?.sun
        ? `Güneş ${natal.sun.sign} (${natal.sun.house}. ev), Ay ${natal.moon?.sign || '?'} (${natal.moon?.house || '?'}. ev), Yükselen ${natal.rising?.sign || '?'}`
        : 'bilinmiyor';
    const planetLines = currentPlanets
        .slice(0, 10)
        .map(p => `${p.planetNameTR}: ${p.sign} ${p.degree.toFixed(0)}° (${p.house}. ev${p.retrograde ? ', retro' : ''})`)
        .join('; ');
    const transitLines = transits
        .slice(0, 5)
        .map(t => `Transit ${t.transitPlanet} ${t.type === 'Conjunction' ? 'kavuşum' : t.type === 'Square' ? 'kare' : t.type === 'Trine' ? 'üçgen' : 'karşıt'} natal ${t.natalPlanet}`)
        .join('; ');

    const prompt = `
    Bugünün Tarihi: ${today}

    Senin adın Valeria. Horary (soru astrolojisi) konusunda uzman, sezgileri çok güçlü spiritüel bir rehbersin. ASLA yapay zeka olduğunu söyleme. Karşındaki kişiyle doğrudan, samimi ve "Sen" diliyle konuş.

    SORU: "${question}"

    SORAN KİŞİ:
    ${buildNatalBlock({
        name: userContext.name,
        birthDate: userContext.birthDate,
        gender: userContext.gender,
        relationshipStatus: userContext.relationshipStatus,
        workStatus: userContext.jobStatus,
    })}
    NATAL HARİTA: ${natalLine}
    GEZEGEN YERLEŞİMLERİ: ${planetLines}
    AKTİF TRANSİTLER: ${transitLines || 'önemli transit yok'}
    ${historyBlock ? `\n    ${historyBlock}\n` : ''}

    GÖREV — Horary hükmü ver. Analizini içinden yap (ev/gezegen belirle, ilgili
    yerleşim ve transitleri değerlendir, yaş/cinsiyet/ilişki-iş durumuna uyarla)
    ama kullanıcıya SADECE damıtılmış sonucu göster:

    - "netYanit": Soruya DOĞRUDAN, tek cümlelik net cevap (Evet / Hayır / Koşullu
      açıkça belli olsun). Ör: "Evet — bu ay dönüşün mümkün görünüyor."
    - "yorum": EN FAZLA 3-4 KISA cümle: en güçlü 1-2 astrolojik gerekçe + varsa
      koşul ve zamanlama ipucu. Uzun paragraf, ev/açı listesi dökümü YASAK —
      kişinin anlayacağı sade dil.

    SADECE geçerli JSON döndür:
    { "netYanit": "...", "yorum": "..." }
    Türkçe yaz.
    `;

    try {
        // Horary bir "hüküm" işi — derin akıl yürütme açık, kaliteli model.
        let text = await aiGenerate(prompt, { tier: 'quality', thinking: true, json: true, maxTokens: 4000 });
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.netYanit) {
                return { verdict: String(parsed.netYanit), comment: String(parsed.yorum || '') };
            }
        }
        return { verdict: text || 'Yıldızlar sessiz.', comment: '' };
    } catch (error) {
        console.error('[AI] askHoraryQuestion failed, using fallback:', error);
        return { verdict: 'Yıldızlar şu an bu sorunun cevabını saklı tutuyor. Birazdan tekrar dener misin?', comment: '' };
    }
};

// ==================== TAROT INTERPRETATION ====================
export const generateTarotInterpretation = async (
    cardName: string,
    isReversed: boolean,
    question: string,
    user: any
): Promise<string> => {
    if (AI_BYPASS) return cannedTarot(cardName, isReversed, user);
    const direction = isReversed ? "ters" : "düz";
    const today = new Date().toISOString().split('T')[0];
    const historyBlock = await buildHistoryBlock(user?._id?.toString?.() || '');
    const prompt = `
    Bugünün Tarihi: ${today}

    Deneyimli bir tarot okuyucusu olarak bu çekimi yorumla.

    ÇEKİLEN KART: ${cardName} (${direction} pozisyon)

    SORAN KİŞİ:
    ${buildNatalBlock(user || {})}

    ${question ? `SORU: "${question}"` : 'Genel bir okuma.'}
    ${historyBlock ? `\n    ${historyBlock}\n` : ''}
    Bu kart için mistik, derin ve kişisel bir yorum yap. Kişinin doğum haritasını (Güneş/Ay/Yükselen), yaşını, cinsiyetini/yönelimini, ilişki ve iş durumunu dikkate alarak aşk, kariyer ve ruhsal rehberlik konularında somut mesajlar ver.
    Geçmiş fallarında çıkan kartlar veya sorularla bağ kurabiliyorsan kur — yorumların birbirini tamamlasın.
    Maksimum 4-5 cümle. En içten halinle, Valeria olarak yanıtla. Türkçe yaz.
  `;

    try {
        const responseText = await aiGenerate(prompt, { tier: 'quality' });
        return responseText || "Kartlar şu an sessiz...";
    } catch (error) {
        console.error('[AI] generateTarotInterpretation failed, using fallback:', error);
        return "Bu kart derin bir mesaj taşıyor. Sezgilerinize güvenin.";
    }
};

// ==================== TAROT SPREAD (3 KART, TEK ÇAĞRI) ====================
// Üç kart ayrı ayrı değil, TEK çağrıda bütün olarak yorumlanır: her kartın
// pozisyonu (Geçmiş/Şimdi/Gelecek) bilinir, kartlar birbirine ve kişinin
// haritasına/geçmiş fallarına bağlanır, sonda bir sentez verilir.
export interface SpreadCardInput {
    nameTR: string;
    isReversed: boolean;
    position: string;
    keywordsTR?: string[];
}

export const generateTarotSpreadReading = async (
    cards: SpreadCardInput[],
    question: string,
    user: any
): Promise<{ interpretations: string[]; synthesis: string }> => {
    if (AI_BYPASS) {
        return {
            interpretations: cards.map(c => cannedTarot(c.nameTR, c.isReversed, user)),
            synthesis: 'Üç kartın birleşimi, geçmişten bugüne uzanan yolun yakında berraklaşacağını fısıldıyor.',
        };
    }

    const historyBlock = await buildHistoryBlock(user?._id?.toString?.() || '');
    const today = new Date().toISOString().split('T')[0];

    const cardLines = cards
        .map((c, i) => `${i + 1}. ${c.position}: ${c.nameTR} (${c.isReversed ? 'ters' : 'düz'})${c.keywordsTR?.length ? ` — anahtar kelimeler: ${c.keywordsTR.join(', ')}` : ''}`)
        .join('\n    ');

    const prompt = `
    Bugünün Tarihi: ${today}

    Deneyimli bir tarot okuyucusu olarak üç kartlık bir açılımı BÜTÜN olarak yorumla.

    AÇILIM (pozisyonlar sabit):
    ${cardLines}

    SORAN KİŞİ:
    ${buildNatalBlock(user || {})}
    ${historyBlock ? `\n    ${historyBlock}\n` : ''}
    ${question ? `SORU: "${question}" — tüm yorumları bu soruya odakla.` : 'Soru yok — kişinin hayatının genel akışına (aşk, iş, ruhsal durum) odaklan.'}

    KURALLAR:
    - Her kartı KENDİ POZİSYONUNDA yorumla (Geçmiş: yaşanmış etkiler; Şimdi: mevcut enerji; Gelecek: olası gidişat).
    - Kartları birbirine bağla — ör. geçmiş kartındaki tema, şimdi kartında nasıl evriliyor?
    - Kişinin burcunu/yükselenini/element enerjisini ve ilişki-iş durumunu yorumlara dokundur.
    - Yorumları kişinin YAŞINA, cinsiyetine/yönelimine ve hayat evresine göre uyarla (öğrenci/çalışan, bekar/evli farkı hissedilsin).
    - Geçmiş fallarıyla anlam bütünlüğü kur; çelişme.
    - Her kart yorumu 4-6 cümle; sentez 3-5 cümle, net bir mesajla bitsin.

    SADECE geçerli JSON döndür:
    {
      "kartlar": [
        { "yorum": "1. kartın (Geçmiş) yorumu" },
        { "yorum": "2. kartın (Şimdi) yorumu" },
        { "yorum": "3. kartın (Gelecek) yorumu" }
      ],
      "sentez": "Üç kartın ortak hikayesi ve net mesaj"
    }
    Türkçe yaz.`;

    try {
        let text = await aiGenerate(prompt, { json: true, tier: 'quality', maxTokens: 3200 });
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const interpretations = cards.map((c, i) =>
                parsed?.kartlar?.[i]?.yorum || cannedTarot(c.nameTR, c.isReversed, user));
            return { interpretations, synthesis: parsed?.sentez || '' };
        }
        throw new Error('JSON bulunamadı');
    } catch (error) {
        console.error('[AI] generateTarotSpreadReading failed, using fallback:', error);
        return {
            interpretations: cards.map(c => cannedTarot(c.nameTR, c.isReversed, user)),
            synthesis: '',
        };
    }
};

// ==================== COFFEE READING ====================
// İki aşamalı boru hattı:
//   1) Vision (Gemini): fincan fotoğraflarını doğrular ve telvedeki şekilleri
//      yapılandırılmış bir SEMBOL LİSTESİNE çevirir (DeepSeek görsel okuyamaz).
//   2) Yorum (aiGenerate → DeepSeek v4-pro): sembol listesi + kişinin doğum
//      haritası + geçmiş fallarıyla, soru odaklı uzun Türkçe kahve falı yazar.
// Gemini yoksa 1. aşama atlanır; fal sezgisel modda yine üretilir.

const COFFEE_REJECT = {
    soruCevabi: "Canım, gönderdiğin fotoğraflarda bir kahve fincanı göremiyorum... Gerçek bir fal için fincanının içini çekip bana göndermelisin. Lütfen doğru fotoğraflar yükle, o zaman senin için zevkle, uzun uzun yorumlayacağım.",
    askHayati: "",
    kariyer: "",
    aile: ""
};

interface CupSymbols {
    isCoffeeCup: boolean;
    symbols: Array<{ sembol: string; konum: string; cagrisim: string }>;
    genelIzlenim: string;
}

type CupExtraction =
    | { kind: 'ok'; data: CupSymbols }
    | { kind: 'invalid' }        // fotoğraflar fincan değil → fal reddedilir
    | { kind: 'unavailable' };   // vision yapılamadı (key yok / servis hatası) → fal verilmez, kredi kesilmez

/** 1. Aşama — fotoğrafları Gemini vision ile doğrular ve sembol listesine çevirir. */
const extractCupSymbols = async (imagesBase64: string[]): Promise<CupExtraction> => {
    if (!imagesBase64?.length) return { kind: 'invalid' };
    if (!process.env.GEMINI_API_KEY) return { kind: 'unavailable' };

    const visionPrompt = `
    Sen bir Türk kahvesi falı için görüntü analiz asistanısın. Sana içilmiş kahve fincanı/tabağı fotoğrafları verilecek.

    GÖREV 1 — Doğrulama: Fotoğrafların TÜMÜ içilmiş kahve fincanı veya kahve tabağı mı? Alakasız bir görüntü (kedi, selfie, araba vb.) varsa isCoffeeCup=false döndür.
    GÖREV 2 — Sembol çıkarımı: Fincan geçerliyse telvedeki şekilleri fal geleneğindeki gibi tespit et: kuş, yol, kalp, dağ, harf, sayı, insan silüeti, ağaç, yılan, balık, kapı, göz vb. Her sembol için fincandaki konumu (ağız kenarı / orta / dip / tabak) ve klasik fal çağrışımını yaz.

    SADECE geçerli JSON döndür:
    {
      "isCoffeeCup": true,
      "symbols": [
        { "sembol": "kuş", "konum": "ağız kenarı", "cagrisim": "yakında gelecek haber" }
      ],
      "genelIzlenim": "Telvenin genel dağılımı, aydınlık/karanlık dengesi hakkında 1-2 cümle."
    }
    En az 5, en fazla 12 sembol çıkar. Türkçe yaz.`;

    const parts: any[] = [visionPrompt];
    imagesBase64.forEach(b64 => {
        if (b64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: b64.replace(/^data:image\/\w+;base64,/, '')
                }
            });
        }
    });

    try {
        const response = await getAI().models.generateContent({
            model: AI_MODEL,
            contents: parts,
        });
        const raw = (response.text || '').replace(/```json|```/g, '').trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return { kind: 'unavailable' };
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.isCoffeeCup === false) return { kind: 'invalid' };
        return {
            kind: 'ok',
            data: {
                isCoffeeCup: true,
                symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
                genelIzlenim: parsed.genelIzlenim || '',
            },
        };
    } catch (error) {
        console.error('[AI] extractCupSymbols failed (vision):', error);
        // Doğrulama yapılamadıysa fal VERİLMEZ (sahte/boş resimle yorum
        // alınamasın) — route kredi kesmeden hata döndürür.
        return { kind: 'unavailable' };
    }
};

export interface CoffeeReadingResult {
    soruCevabi: string;
    askHayati: string;
    kariyer: string;
    aile: string;
    /** Fotoğraflar fincan değil → route 400 döner, kredi KESİLMEZ. */
    rejected?: boolean;
    /** Doğrulama yapılamadı (vision yok/hata) → route 503 döner, kredi KESİLMEZ. */
    unavailable?: boolean;
}

export const generateCoffeeReading = async (
    imagesBase64: string[] = [],
    user: any,
    question?: string
): Promise<CoffeeReadingResult> => {
    if (AI_BYPASS) return cannedCoffee(user, question);

    // 1. Aşama — vision doğrulaması ZORUNLU: fincan görülmeden fal verilmez.
    const cup = await extractCupSymbols(imagesBase64);
    if (cup.kind === 'invalid') return { ...COFFEE_REJECT, rejected: true };
    if (cup.kind === 'unavailable') {
        return {
            soruCevabi: 'Canım, şu an fincanını göremiyorum — falcının gözü kapalıyken fal bakılmaz. Birkaç dakika sonra tekrar dener misin?',
            askHayati: '', kariyer: '', aile: '',
            unavailable: true,
        };
    }

    const symbolBlock = `FİNCANDA TESPİT EDİLEN SEMBOLLER (fotoğraflardan çıkarıldı — yorumunu BUNLARA dayandır, sembolleri tasvir ederek anlat):\n${cup.data.symbols.map(sy => `- ${sy.sembol} (${sy.konum}): ${sy.cagrisim}`).join('\n')}\nGenel izlenim: ${cup.data.genelIzlenim}`;

    const coffeeHistory = await buildHistoryBlock(user?._id?.toString?.() || '');

    // 2. Aşama — yorum
    const prompt = `
    Bugünün Tarihi: ${new Date().toISOString().split('T')[0]}

    Usta ve geveze bir Türk kahve falcısı olarak fal bak. "Sen", "Tatlım", "Canım" gibi sıcak bir dille, kalabalık, uzun ve detaylı yorumlar yap.

    SORAN KİŞİ:
    ${buildNatalBlock(user || {})}
    ${coffeeHistory ? `\n    ${coffeeHistory}\n` : ''}
    ${symbolBlock}

    ${question ? `KULLANICININ SORUSU: "${question}" — soruCevabi bölümünde bu soruya odaklan.` : 'Soru sorulmadı — soruCevabi bölümünde falın en çarpıcı ana mesajını yaz.'}

    Yorumlarında kişinin burcunu/elementini ve ilişki-iş durumunu sembollerle harmanla; geçmiş fallarıyla çelişme, gerekirse atıf yap.
    Falı kişinin YAŞINA, cinsiyetine/yönelimine ve hayat evresine göre uyarla — genç bir öğrenciye okul/heyecan dilinden,
    evli bir çalışana yuva/istikrar dilinden konuş.
    Tamamen Türkçe yaz — İngilizce kelime (cup, love, career vb.) KULLANMA; "fincan", "aşk", "kariyer" de.

    SADECE geçerli JSON döndür (markdown işaretleri OLMADAN):
    {
      "soruCevabi": "${question ? 'Soruya doğrudan, falda görülenlerle destekleyerek uzun cevap.' : 'Falın ana mesajı, detaylı.'}",
      "askHayati": "Aşk ve ilişki: kalp, yol, silüet gibi sembolleri tasvir ederek sıcak, dedikodu tadında en az 8 cümle.",
      "kariyer": "İş, para, kariyer yolları ve kapılar: sembollerle harmanlanmış en az 8 cümle.",
      "aile": "Aile, yakın çevre, haset/göz uyarıları: en az 8 cümle."
    }
    `;

    try {
        let text = await aiGenerate(prompt, { json: true, tier: 'quality', maxTokens: 3600 });
        text = text.replace(/```json|```/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    soruCevabi: parsed.soruCevabi || 'Fincanınız ilginç mesajlar taşıyor...',
                    askHayati: parsed.askHayati || '',
                    kariyer: parsed.kariyer || '',
                    aile: parsed.aile || '',
                };
            } catch {
                // JSON parse failed, use full text as soruCevabi
            }
        }
        return {
            soruCevabi: text || 'Fincanınız ilginç şekiller barındırıyor...',
            askHayati: '',
            kariyer: '',
            aile: '',
        };
    } catch (error) {
        console.error('[AI] generateCoffeeReading failed, using fallback:', error);
        return {
            soruCevabi: 'Fincanınızda güçlü enerjiler görünüyor. Yakın zamanda güzel haberler alabilirsiniz.',
            askHayati: 'Aşk hayatınızda olumlu gelişmeler kapıda. Sabırlı olun.',
            kariyer: 'İş hayatınızda yeni fırsatlar beliriyor.',
            aile: 'Aile bağlarınız güçlenecek.',
        };
    }
};

// ==================== DAILY HOROSCOPE ====================
export const generateDailyHoroscope = async (sign: string): Promise<{
    general: string;
    love: string;
    career: string;
    health: string;
    luckyNumber: number;
    luckyColor: string;
    compatibility: string;
}> => {
    if (AI_BYPASS) return cannedDailyHoroscope(sign);
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Sen profesyonel bir astrologsun. ${sign} burcu için ${today} tarihli günlük yorum yaz.
    
    Aşağıdaki JSON formatında SADECE JSON döndür:
    {
      "general": "Genel günlük yorum (2-3 cümle)",
      "love": "Aşk yorumu (1-2 cümle)",
      "career": "Kariyer yorumu (1-2 cümle)",
      "health": "Sağlık yorumu (1 cümle)",
      "luckyNumber": 7,
      "luckyColor": "Renk adı",
      "compatibility": "En uyumlu burç adı"
    }
  `;

    try {
        const responseText = await aiGenerate(prompt, { json: true, tier: 'fast' });

        if (responseText) {
            let cleanText = responseText.trim();
            if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
            if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
            if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
            return JSON.parse(cleanText);
        }
        throw new Error("Boş yanıt");
    } catch (error) {
        return {
            general: `Bugün ${sign} burcu için enerjik bir gün. Sezgilerinize güvenin ve yeni fırsatlara açık olun.`,
            love: "Aşk hayatınızda güzel sürprizler olabilir.",
            career: "İş yerinde yaratıcılığınız ön plana çıkacak.",
            health: "Meditasyona vakit ayırın.",
            luckyNumber: Math.floor(Math.random() * 9) + 1,
            luckyColor: "Mor",
            compatibility: "Akrep"
        };
    }
};

// ==================== WEEKLY HOROSCOPE ====================
export const generateWeeklyHoroscope = async (sign: string): Promise<{
    general: string;
    love: string;
    career: string;
    advice: string;
}> => {
    if (AI_BYPASS) return cannedWeeklyHoroscope(sign);
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);

    const prompt = `
    Sen profesyonel bir astrologsun. ${sign} burcu için ${today.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]} haftalık yorum yaz.
    
    Aşağıdaki JSON formatında SADECE JSON döndür:
    {
      "general": "Genel haftalık yorum (3-4 cümle)",
      "love": "Aşk yorumu (2 cümle)",
      "career": "Kariyer yorumu (2 cümle)",
      "advice": "Haftalık tavsiye (1-2 cümle)"
    }
  `;

    try {
        const responseText = await aiGenerate(prompt, { json: true, tier: 'fast' });

        if (responseText) {
            let cleanText = responseText.trim();
            if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
            if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
            if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
            return JSON.parse(cleanText);
        }
        throw new Error("Boş yanıt");
    } catch (error) {
        return {
            general: `Bu hafta ${sign} burcu için derin duygusal dönüşümler yaşanabilir.`,
            love: "İlişkilerde dürüstlük ön plana çıkacak.",
            career: "İş hayatında yeni fırsatlar kapınızı çalabilir.",
            advice: "İç sesinizi dinleyin ve sezgilerinize güvenin."
        };
    }
};

// ==================== COMPATIBILITY ====================
export const generateCompatibility = async (sign1: string, sign2: string): Promise<{
    overallScore: number;
    love: number;
    friendship: number;
    communication: number;
    description: string;
    strengths: string[];
    challenges: string[];
}> => {
    if (AI_BYPASS) return cannedCompatibility(sign1, sign2);
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}

    Sen profesyonel bir astrologsun. ${sign1} ve ${sign2} burçları arasındaki uyumu analiz et.
    
    Aşağıdaki JSON formatında SADECE JSON döndür:
    {
      "overallScore": 85,
      "love": 90,
      "friendship": 80,
      "communication": 75,
      "description": "Bu iki burç arasındaki ilişki hakkında 2-3 cümlelik yorum",
      "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
      "challenges": ["Zorluk 1", "Zorluk 2"]
    }
    Skorlar 0-100 arası olmalı.
  `;

    try {
        const responseText = await aiGenerate(prompt, { json: true, tier: 'fast' });

        if (responseText) {
            let cleanText = responseText.trim();
            if (cleanText.startsWith("```json")) cleanText = cleanText.slice(7);
            if (cleanText.startsWith("```")) cleanText = cleanText.slice(3);
            if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
            return JSON.parse(cleanText);
        }
        throw new Error("Boş yanıt");
    } catch (error) {
        return {
            overallScore: 75,
            love: 70,
            friendship: 80,
            communication: 72,
            description: `${sign1} ve ${sign2} arasında ilginç bir dinamik var.`,
            strengths: ["Karşılıklı saygı", "Tamamlayıcı enerji"],
            challenges: ["İletişim farkları", "Farklı öncelikler"]
        };
    }
};

// ==================== DAILY TAROT MESSAGE ====================
export const generateDailyTarotMessage = async (
    cardName: string,
    isReversed: boolean,
    userSign: string,
    user?: any
): Promise<string> => {
    if (AI_BYPASS) return cannedDailyTarotMessage(cardName, isReversed, userSign);
    const direction = isReversed ? "ters" : "düz";
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}

    ${cardName} kartı (${direction}) bugün ${userSign} burcu için çekildi.
    ${user ? `Kişi:\n    ${buildNatalBlock(user)}` : ''}
    Bu kartın bugünkü enerjisini ve kişiye özel mesajını GÜNLÜK TAROT YORUMU olarak aktar.
    Kişinin burcunu, yaşını ve ilişki-iş durumunu dikkate alarak sadece ve tam olarak 3 (üç) cümle kur.
    Sıcak ve mistik bir üslupla, doğrudan Valeria olarak hitap et.
    `;

    try {
        const responseText = await aiGenerate(prompt, { tier: 'fast' });
        return responseText || `Bugün ${cardName} kartı sizinle. Evrenin mesajlarına kulak verin.`;
    } catch (error) {
        return `Bugün ${cardName} kartı sizinle. Evrenin mesajlarına kulak verin.`;
    }
};

// ==================== NUMEROLOGY AI READING ====================
export const generateNumerologyReading = async (
    name: string,
    birthDate: string,
    lifePath: number,
    expression: number,
    soulUrge: number,
    personality: number,
    user?: any
): Promise<{ lifePath: string; expression: string; soulUrge: string; personality: string; genel: string }> => {
    if (AI_BYPASS) return cannedNumerology(name, lifePath, expression, soulUrge, personality);
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}

    Pisagor sistemine göre usta bir numerolog olarak analiz yap.

    Kişi: ${name}
    Doğum Tarihi: ${birthDate}
    ${user ? `Doğum haritası bağlamı:\n    ${buildNatalBlock(user)}\n    (Numeroloji yorumlarını burç/element enerjileriyle harmanla — ör. Yaşam Yolu ${lifePath} ile ${user.sunSign || ''} Güneşi'nin ortak teması.)` : ''}

    Sayıları:
    - Yaşam Yolu (Life Path): ${lifePath}
    - Kader/İfade Sayısı (Expression): ${expression}
    - Ruh Arzu Sayısı (Soul Urge): ${soulUrge}
    - Kişilik Sayısı (Personality): ${personality}
    
    Her sayı için 3-4 cümlelik derinlikli ve samimi Valeria üslubuyla yorum yap. Son bölümde genel bir sentez oluştur.
    
    JSON formatında yanıt ver:
    {
      "lifePath": "Yaşam yolu sayısı yorumu...",
      "expression": "Kader sayısı yorumu...",
      "soulUrge": "Ruh arzu sayısı yorumu...",
      "personality": "Kişilik sayısı yorumu...",
      "genel": "Tüm sayıların sentezi, kişiye özel genel yorum..."
    }
    
    SADECE JSON döndür. Türkçe yaz.
  `;

    try {
        const responseText = await aiGenerate(prompt, { json: true, tier: 'quality', maxTokens: 3000 });
        const text = responseText || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    lifePath: parsed.lifePath || '',
                    expression: parsed.expression || '',
                    soulUrge: parsed.soulUrge || '',
                    personality: parsed.personality || '',
                    genel: parsed.genel || '',
                };
            } catch { /* fallthrough */ }
        }
        return {
            lifePath: 'Yaşam yolu sayınız güçlü mesajlar taşıyor.',
            expression: 'Kader sayınız önemli ipuçları sunuyor.',
            soulUrge: 'Ruh arzunuz derinlikli anlamlar barındırıyor.',
            personality: 'Kişilik sayınız karakterinizi yansıtıyor.',
            genel: text || 'Numeroloji profiliniz ilginç mesajlar taşıyor.',
        };
    } catch {
        return {
            lifePath: 'Yaşam yolu sayınız güçlü mesajlar taşıyor.',
            expression: 'Kader sayınız önemli ipuçları sunuyor.',
            soulUrge: 'Ruh arzunuz derinlikli anlamlar barındırıyor.',
            personality: 'Kişilik sayınız karakterinizi yansıtıyor.',
            genel: 'Numeroloji profiliniz eşsiz bir enerji haritası çiziyor.',
        };
    }
};

