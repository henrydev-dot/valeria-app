import { GoogleGenAI } from '@google/genai';
import { AnalysisResult, NumerologyData, PlanetPosition, TransitData, UserInput } from '../types';
import { ZODIAC_DATA } from '../constants';

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
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        if (response.text) {
            let cleanText = response.text.trim();
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
export const askHoraryQuestion = async (
    question: string,
    transits: TransitData[],
    currentPlanets: PlanetPosition[],
    userContext: UserInput
): Promise<string> => {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}
    
    Senin adın Valeria. Sezgileri çok güçlü, mistik yeteneklere sahip spiritüel bir rehbersin. ASLA yapay zeka olduğunu söyleme. Karşındaki kişiyle doğrudan, samimi ve "Sen" diliyle konuş.
    
    Soru: "${question}"
    Bağlam: Kullanıcı adı ${userContext.name}, Cinsiyet/Yönelim: ${userContext.gender}, İlişki Durumu: ${userContext.relationshipStatus}, İş/Kariyer: ${userContext.jobStatus}.
    Transitler: ${transits.slice(0, 3).map(t => t.transitPlanet).join(', ')} gezegenleri gökyüzünde.
    
    Bu soruya astrolojik, mistik ve net bir cevap ver (maksimum 3 cümle). Kullanıcının mevcut kişisel durumunu (iş/ilişki) hesaba kat.
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Yıldızlar sessiz.";
    } catch (error) {
        return "Yıldızlar şu an bu sorunun cevabını saklı tutuyor. (API Hatası)";
    }
};

// ==================== TAROT INTERPRETATION ====================
export const generateTarotInterpretation = async (
    cardName: string,
    isReversed: boolean,
    question: string,
    user: any
): Promise<string> => {
    const direction = isReversed ? "ters" : "düz";
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}
    
    Senin adın Valeria. Sezgileri çok güçlü, mistik yeteneklere sahip deneyimli bir tarot okuyucususun. ASLA yapay zeka olduğunu söyleme. Karşındaki kişiyle samimi, doğrudan ve "Sen" diliyle, gerçek bir falcı gibi konuş. 
    
    Kart: ${cardName} (${direction} pozisyon)
    Kullanıcı Detayları:
    - Burç: ${user?.sunSign || 'Bilinmiyor'}
    - İsim: ${user?.name || 'Bilinmiyor'}
    - Cinsiyet/Yönelim: ${user?.gender || 'Bilinmiyor'}
    - İlişki Durumu: ${user?.relationshipStatus || 'Bilinmiyor'}
    - İş Durumu: ${user?.workStatus || 'Bilinmiyor'}
    
    ${question ? `Soru: "${question}"` : 'Genel bir okuma.'}
    
    Bu kart için mistik, derin ve kişisel bir yorum yap. Kullanıcının ilişki ve iş durumunu dikkate alarak 
    aşk, kariyer ve ruhsal rehberlik konularında somut mesajlar ver. 
    Kişinin burcunu ve yönelim/ilişki detaylarını yorumuna sezgisel olarak kat. Maksimum 4-5 cümle. En içten halinle, Valeria olarak yanıtla. Türkçe yaz.
  `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Kartlar şu an sessiz...";
    } catch (error) {
        return "Bu kart derin bir mesaj taşıyor. Sezgilerinize güvenin.";
    }
};

// ==================== COFFEE READING ====================
export const generateCoffeeReading = async (
    imagesBase64: string[] = [],
    user: any,
    question?: string
): Promise<{ soruCevabi: string; askHayati: string; kariyer: string; aile: string }> => {

    const userContext = `
    Bugünün Tarihi: ${new Date().toISOString().split('T')[0]}
    
    Kullanıcı Detayları:
    - Burç: ${user?.sunSign || 'Bilinmiyor'}
    - İsim: ${user?.name || 'Bilinmiyor'}
    - Cinsiyet/Yönelim: ${user?.gender || 'Bilinmiyor'}
    - İlişki Durumu: ${user?.relationshipStatus || 'Bilinmiyor'}
    - İş Durumu: ${user?.workStatus || 'Bilinmiyor'}
    `;

    const prompt = `
    Senin adın Valeria. Sezgileri çok güçlü, gerçek, usta ve geveze bir Türk kahve falcısısın. Asla yapay zeka olduğunu söyleme, bilgisayardan bahsetme. Karşındaki kişiyle doğrudan, samimi, içten ve "Sen", "Tatlım", "Canım" gibi sıcak bir dille konuş. Tıpkı gerçek bir falcı gibi kalabalık, uzun ve detaylı yorumlar yapacaksın.
    
    ${userContext}
    ${question ? `Kullanıcının sorusu: "${question}"` : ''}
    
    ÖNEMLİ GÖREV: 
    İlk olarak sana gönderilen fotoğraflara bak. Eğer bu fotoğraflardan HERHANGİ BİRİ kahve fincanı veya kahve tabağı değilse (örneğin; kedi, araba, ev, selfie veya alakasız başka bir resimse), fal bakmayı KESİNLİKLE REDDET ve JSON yanıtı olarak SAHTE RESİM HATA MESAJI döndür:
    {
      "soruCevabi": "Canım, gönderdiğin fotoğraflarda bir kahve fincanı göremiyorum... Gerçek bir fal için fincanının içini çekip bana göndermelisin. Lütfen doğru fotoğraflar yükle, o zaman senin için zevkle, uzun uzun yorumlayacağım.",
      "askHayati": "",
      "kariyer": "",
      "aile": ""
    }
    
    Eğer fotoğrafların Tümü İÇİLMİŞ BİR KAHVE FİNCANI VE TABAĞI İSE, fincandaki telvelerde gördüğün spesifik şekillere, yollara, harflere ve sembollere odaklanarak çok UZUN, çok DETAYLI ve SOHBET HAVASINDA bir Türk Kahvesi Falı bak. Her kategori için en az 8-10 cümle yaz. Fincanda gördüğün şekilleri tasvir et (Örneğin: "Şurada bir kuş belirmiş, ağzında bir haber var", "Çok aydınlık bir yolun açılmış, sonu ferah"). Kullanıcının cinsiyetine ve ilişki durumuna göre son derece kişiselleştir. Asla AI olduğunu çaktırma. Senin adın Valeria, sen özel bir falcısın.
    
    SADECE VE SADECE AŞAĞIDAKİ GİBİ GEÇERLİ JSON FORMATINDA YANIT VER (Başında ve sonunda \`\`\`json veya markdown işaretleri OLMAYACAK):
    {
      "soruCevabi": "${question ? 'Kullanıcının sorusuna doğrudan, falda gördüklerinle destekleyerek ve hislerini katarak uzun uzadıya cevap ver.' : 'Fincanda gördüğün baskın enerjiye ve harflere göre falın en çarpıcı ana mesajını detaylıca yaz.'}",
      "askHayati": "Aşk hayatı ve ilişkisi hakkında fincanda çıkan kalp, yol, iki insan silüeti vb. sembolleri tasvir ederek çok detaylı, sıcak ve fısıltılı dedikodu tadında yorumlar (en az 8 cümle).",
      "kariyer": "İş, para harfleri, kariyerdeki yollar ve kapılar hakkında fal sembolleriyle harmanlanmış oldukça uzun yorum (en az 8 cümle).",
      "aile": "Aile, yakın çevre, hane içi aydınlık, dışarıdan gelen göz/haset ve dostlarla ilgili uyarı ve çok detaylı yorumlar (en az 8 cümle)."
    }
    `;

    const parts: any[] = [prompt];

    if (imagesBase64 && imagesBase64.length > 0) {
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
    }

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: parts,
        });
        let text = response.text || '';
        if (text.startsWith("```json")) text = text.slice(7);
        if (text.startsWith("```")) text = text.slice(3);
        if (text.endsWith("```")) text = text.slice(0, -3);
        text = text.trim();
        // Try to parse JSON from response
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
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
            let cleanText = response.text.trim();
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
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
            let cleanText = response.text.trim();
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
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
            let cleanText = response.text.trim();
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
    userSign: string
): Promise<string> => {
    const direction = isReversed ? "ters" : "düz";
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}
    
    Senin adın Valeria. Deneyimli, sezgisel bir tarot okuyucususun. Asla yapay zeka olduğunu söyleme.
    ${cardName} kartı (${direction}) bugün ${userSign} burcu için çekildi.
    Bu kartın bugünkü enerjisini ve kişiye özel mesajını GÜNLÜK TAROT YORUMU olarak aktar. 
    Kişinin burcunu dikkate alarak sadece ve tam olarak 3 (üç) cümle kur. Sıcak ve mistik bir üslupla, doğrudan Valeria olarak hitap et.
    `;

    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || `Bugün ${cardName} kartı sizinle. Evrenin mesajlarına kulak verin.`;
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
    personality: number
): Promise<{ lifePath: string; expression: string; soulUrge: string; personality: string; genel: string }> => {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Bugünün Tarihi: ${today}
    
    Senin adın Valeria. Sezgileri çok güçlü bir Numerolog ve mistik rehbersin. Asla yapay zeka olduğunu söyleme. Karşındaki kişiyle samimi ve "Sen" diliyle konuş. Pisagor sistemine göre analiz yap.
    
    Kişi: ${name}
    Doğum Tarihi: ${birthDate}
    
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
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text || '';
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

