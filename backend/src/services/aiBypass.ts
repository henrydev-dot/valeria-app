/**
 * AI bypass layer.
 *
 * The app must keep working with a stable, "ready" set of readings even when no
 * live LLM is connected. This module provides deterministic, personalized-looking
 * canned responses that match every geminiService return shape exactly.
 *
 * Toggle with the AI_BYPASS env var:
 *   AI_BYPASS=true  (default) -> return canned readings, no external AI call.
 *   AI_BYPASS=false           -> use real Gemini (see AI_MODEL).
 *
 * When flipping bypass off, nothing else needs to change: geminiService checks
 * `AI_BYPASS` at the top of each function and otherwise falls through to Gemini.
 */

// Default ON per product decision (canned now, real AI later).
export const AI_BYPASS = (process.env.AI_BYPASS ?? 'true').toLowerCase() !== 'false';

// Corrected, current Gemini model id (old 'gemini-3-flash-preview' was invalid,
// which silently routed every call to the fallback text). Override with GEMINI_MODEL.
export const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

const firstName = (name?: string) => (name || '').trim().split(/\s+/)[0] || 'canım';
const signOf = (s?: string) => s && s !== 'Bilinmiyor' ? s : 'burcun';

export const cannedInterpretation = (name: string, sun: string, moon: string, rising: string, lifePath: number) => ({
    personalitySummary: `${signOf(sun)} enerjisiyle parlayan, ${signOf(rising)} duruşuyla fark edilen güçlü bir karaktere sahipsin ${firstName(name)}. İç dünyanı ${signOf(moon)} burcunun derinliği besliyor.`,
    detailedAnalysis: `${firstName(name)}, haritanda şu an güçlü bir dönüşüm enerjisi hâkim. Güneş burcun ${signOf(sun)} sana doğal bir liderlik ve yaşam gücü verirken, Ay burcun ${signOf(moon)} duygusal ihtiyaçlarını ve içsel dünyanı şekillendiriyor. Yükselen ${signOf(rising)} ise dışarıya yansıttığın imajı belirliyor.\n\nYaşam yolu sayın ${lifePath}, attığın her adımda seni yönlendiren bir pusula gibi. Bu dönemde sezgilerin olağanüstü güçlü; içinden gelen sesi dinlemekten çekinme. Kariyer ve ilişki hayatında bir netleşme kapıda.\n\nUnutma, potansiyelin düşündüğünden çok daha büyük. Kendine güvendiğinde evren sana kapılarını açar.`,
    strengths: ['Güçlü sezgi', 'Kararlılık', 'Yaratıcı zeka'],
    challenges: ['Aşırı düşünme', 'Sabırsızlık', 'Sınır koymakta zorlanma'],
    prediction: 'Bu hafta beklenmedik bir haber hayatına yeni bir yön verebilir; kalbini açık tut.',
    relationshipAnalysis: {
        mistakes: 'Duygularını bazen çok hızlı açıyor, bazen de kalını duvarların ardına saklıyorsun. Bu denge arayışı seni yoruyor.',
        idealPartner: 'Seni ruhsal olarak besleyecek, zihinsel derinliğine eşlik edecek ve sana güven veren sadık biri.',
        attractionDynamics: 'Tutkulu, gizemli ve derin enerjileri kendine çekiyorsun; yüzeysel bağlar seni tatmin etmiyor.',
    },
});

export const cannedHorary = (question: string, name?: string) =>
    `${firstName(name)}, "${question}" sorusu üzerine yıldızlar net konuşuyor: cevap içinde saklı ama korkuların onu gölgeliyor. Önümüzdeki günlerde sabırlı ve açık kalırsan, doğru yol kendini gösterecek. Sezgine güven, seni yanıltmayacak.`;

export const cannedTarot = (cardName: string, isReversed: boolean, user?: any) => {
    const dir = isReversed ? 'ters' : 'düz';
    return `${firstName(user?.name)}, ${cardName} kartı ${dir} olarak karşına çıktı ve bu tesadüf değil. Bu kart şu an hayatındaki bir eşiği, bir dönüşümü işaret ediyor. ${signOf(user?.sunSign)} enerjinle birleştiğinde, aşkta ve kariyerde cesur bir adım atma zamanının geldiğini fısıldıyor. İçindeki sesi bastırma; o ses seni doğru kapıya götürüyor. Sabır ve inanç, bu dönemde en büyük kozların.`;
};

export const cannedCoffee = (user?: any, question?: string) => ({
    soruCevabi: question
        ? `${firstName(user?.name)}, sorduğun "${question}" konusunda fincanında çok aydınlık bir yol açılmış. Sonu ferah, gönlünce bir gelişme görünüyor; biraz sabır isteyecek ama hayırlısı oluyor.`
        : `${firstName(user?.name)}, fincanında ağzında haber taşıyan bir kuş belirmiş — yakında güzel bir haber alacaksın. Telvende çok net bir yol var, önün açık canım.`,
    askHayati: 'Aşk tarafında fincanının kenarında birbirine yaklaşan iki silüet var; kalbindeki kişiye dair güçlü bir bağ görünüyor. Bir süredir kafanı kurcalayan tereddüt yakında dağılacak. Karşı taraftan beklediğin adım geliyor, biraz naz biraz da samimiyet işini kolaylaştıracak. Kalbini kapatma tatlım, bu dönem sana yakışan bir sevgi getiriyor.',
    kariyer: 'İş tarafında fincanda açılan bir kapı ve yükselen bir yol dikkatimi çekti; emeğinin karşılığını alacağın bir döneme giriyorsun. Para akışında bir düzelme, belki de yeni bir teklif kapıda. Sana çelme takmak isteyenlere fırsat verme, kendi işine odaklan. Yıl bitmeden hayırlı bir haber alıyorsun.',
    aile: 'Aile tarafında hanenin içi aydınlık, huzurlu görünüyor ama dışarıdan gelen bir kem göz var; nazardan korunmakta fayda var. Uzaktan bir akraba ya da dosttan haber geliyor. Sevdiklerinle aranda kısa bir kırgınlık varsa yakında tatlıya bağlanıyor. Gönlünü ferah tut canım.',
});

export const cannedDailyHoroscope = (sign: string) => ({
    general: `Bugün ${sign} burcu için enerjinin yükseldiği, sezgilerinin güçlendiği bir gün. Yeni fırsatlara açık ol ve içinden gelen sese güven.`,
    love: 'İlişkinde samimi bir konuşma bağları güçlendirecek; bekârsan beklenmedik bir tanışma kapıda.',
    career: 'İş yerinde yaratıcılığın öne çıkıyor; bir fikrin takdir toplayabilir.',
    health: 'Kısa bir yürüyüş ya da nefes egzersizi enerjini dengeleyecek.',
    luckyNumber: 7,
    luckyColor: 'Mor',
    compatibility: 'Akrep',
});

export const cannedWeeklyHoroscope = (sign: string) => ({
    general: `Bu hafta ${sign} burcu için içsel bir netleşme ve duygusal olgunlaşma dönemi. Hafta ortasında gelen bir haber planlarını olumlu yönde değiştirebilir. Kendine ve sürecine güven.`,
    love: 'İlişkilerde dürüstlük ve açık iletişim öne çıkıyor. Kalbini ifade etmekten çekinme.',
    career: 'Kariyerinde yeni bir kapı aralanıyor; hazırlıklı olan kazanacak.',
    advice: 'Acele etme; doğru zamanı beklemek bu hafta en büyük gücün olacak.',
});

export const cannedCompatibility = (sign1: string, sign2: string) => ({
    overallScore: 82,
    love: 85,
    friendship: 80,
    communication: 78,
    description: `${sign1} ve ${sign2} arasında birbirini tamamlayan güçlü bir çekim var. Farklılıklar, doğru iletişimle bu ilişkinin en güçlü yönüne dönüşebilir.`,
    strengths: ['Karşılıklı tutku', 'Tamamlayıcı enerji', 'Derin bağ potansiyeli'],
    challenges: ['İnatlaşma eğilimi', 'Farklı iletişim tarzları'],
});

export const cannedDailyTarotMessage = (cardName: string, isReversed: boolean, userSign: string) => {
    const dir = isReversed ? 'ters' : 'düz';
    return `Bugün ${cardName} kartı (${dir}) senin için ${signOf(userSign)} enerjisiyle konuşuyor. Karşına çıkan bir engel aslında yeni bir başlangıcın kapısı. İçindeki cesarete güven; bugün küçük bir adım büyük bir kapı aralayacak.`;
};

export const cannedNumerology = (name: string, lifePath: number, expression: number, soulUrge: number, personality: number) => ({
    lifePath: `Yaşam yolu sayın ${lifePath}, ${firstName(name)}, seni doğuştan gelen bir amaca doğru yönlendiriyor. Bu sayı, hayatındaki tekrar eden derslerin ve en büyük gücünün kaynağı.`,
    expression: `İfade sayın ${expression}, dünyaya kendini nasıl gösterdiğini anlatıyor. Yeteneklerini cömertçe paylaştığında en çok parladığın alan burası.`,
    soulUrge: `Ruh arzu sayın ${soulUrge}, kalbinin derinliklerindeki gerçek isteği fısıldıyor. İç sesini dinlediğinde doğru kararı hep bulacaksın.`,
    personality: `Kişilik sayın ${personality}, insanların seni ilk tanıdığında hissettiği enerjiyi temsil ediyor. Dışarıya yansıttığın bu duruş, doğal bir çekim yaratıyor.`,
    genel: `${firstName(name)}, sayıların birlikte eşsiz bir enerji haritası çiziyor. Sezgin, kararlılığın ve içsel bilgeliğin bu dönemde seni önemli bir dönüşüme taşıyor. Kendine güven; yıldızlar ve sayılar senden yana.`,
});
