/**
 * Fill a template string with user data variables.
 * Variables format: {name}, {sunSign}, {goals}, {deity}, {crystals}
 */
export function fillTemplate(
    template: string,
    vars: Record<string, string>
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}

/**
 * Pick a random item from an array of templates.
 */
export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate unique ID.
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate a mock answer for daily questions.
 */
export function generateQuestionAnswer(
    question: string,
    sunSign: string,
    deity: string,
    goals: string[]
): string {
    const templates = [
        `Bu sorunuz {sunSign} burcunuzun etkisiyle derin bir anlam taşıyor. {deity} arketipinizin rehberliğinde, bu konuda sabırlı ve kararlı olmanız öneriliyor. Kısa vadede zorluklar yaşanabilir ancak uzun vadede olumlu gelişmeler sizi bekliyor.`,
        `{sunSign} enerjisi bu konuda size güçlü sezgiler sunuyor. Kendi iç sesinizi dinleyin ve {goals} alanlarındaki önceliklerinizi gözden geçirin. Yakınlarda önemli bir gelişme yaşanabilir.`,
        `{deity} arketipiniz bu konuda uyarı veriyor: acelecilikle karar almayın. Derin bir düşünce sürecinin ardından doğru adımı atacaksınız. {sunSign} burcunuzun sabır ve kararlılık özelliklerini kullanın.`,
        `Bu konudaki endişelerinizi anlıyorum, {sunSign}. Kozmik enerjiler özellikle {goals} alanlarınızda önemli değişimler işaret ediyor. Kendinize güvenin ve akışın içinde kalın.`,
    ];

    const template = pickRandom(templates);
    return fillTemplate(template, {
        sunSign,
        deity,
        goals: goals.slice(0, 2).join(' ve '),
    });
}

/**
 * Generate mock coffee reading result.
 */
export function generateCoffeeResult(question: string, sunSign: string): string {
    const templates = [
        `Fincanınızda gördüğümüz semboller, yakın bir dönemde önemli bir değişiklik yaşanacağına işaret ediyor. ${sunSign} burcunuzun etkisiyle bu değişim olumlu yönde gelişecek. Fincanın alt kısmında gördüğümüz çizgiler, yakın bir gelecekte önemli bir karar alacağınızı gösteriyor.`,
        `Fincan okumanız ilginç mesajlar içeriyor. Kapakta beliren şekiller yeni başlangıçlara, taş kısmında gördüğümüz semboller ise yakın çevrenizden gelecek desteğe işaret ediyor. ${sunSign} burcunuzun sezgisel gücü bu dönemde size rehberlik edecek.`,
        `Fincanınızda bereket ve bolluk sembolleri görüyoruz. ${sunSign} enerjisi ile bu dönem özellikle maddi konularda olumlu gelişmeler yaşanabilir. Günlük hayatınızda dikkatinizi çeken küçük işaretlere kulak verin.`,
    ];

    return pickRandom(templates);
}
