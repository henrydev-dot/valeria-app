import { ZODIAC_DATA, PLANET_INFO, PLANET_THEMES, HOUSE_MEANINGS } from '../constants';
import { UserInput, NumerologyData, PlanetPosition, HouseData, AspectData, TransitData } from '../types';
import * as Astronomy from 'astronomy-engine';

// Helper to check Master Numbers (11, 22, 33)
const reduceNumber = (num: number, allowMaster: boolean = true): number => {
    if (allowMaster && (num === 11 || num === 22 || num === 33)) return num;
    if (num < 10) return num;

    const sum = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    return reduceNumber(sum, allowMaster);
};

export const calculateLifePath = (dateStr: string): number => {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    const rYear = reduceNumber(year, false);
    const rMonth = reduceNumber(month, false);
    const rDay = reduceNumber(day, false);

    return reduceNumber(rYear + rMonth + rDay);
};

export const calculateDestinyNumber = (name: string): number => {
    const alphabet: Record<string, number> = {
        a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
        j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
        s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    const sum = name.toLowerCase().replace(/[^a-z]/g, '').split('').reduce((acc, char) => {
        return acc + (alphabet[char] || 0);
    }, 0);

    return reduceNumber(sum);
};

// --- ASTRONOMY ENGINE INTEGRATION ---

const getZodiacFromLongitude = (lon: number): { sign: string; degree: number; signIndex: number } => {
    const signs = [
        "Aries", "Taurus", "Gemini", "Cancer",
        "Leo", "Virgo", "Libra", "Scorpio",
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    let normLon = lon % 360;
    if (normLon < 0) normLon += 360;

    const index = Math.floor(normLon / 30);
    const degree = normLon % 30;
    return { sign: signs[index], degree, signIndex: index };
};

// Determine House based on Whole Sign system
const calculateHouse = (planetSignIndex: number, risingSignIndex: number): number => {
    let house = (planetSignIndex - risingSignIndex) + 1;
    if (house <= 0) house += 12;
    return house;
};

// Determine Retrograde
const isRetrograde = (body: string, dateObj: Date): boolean => {
    if (body === "Sun" || body === "Moon" || body === "Ascendant") return false;

    const t1 = Astronomy.MakeTime(dateObj);
    const prevDate = new Date(dateObj.getTime() - (60 * 60 * 1000));
    const t2 = Astronomy.MakeTime(prevDate);

    const pos1 = Astronomy.Ecliptic(Astronomy.GeoVector(body as Astronomy.Body, t1, true));
    const pos2 = Astronomy.Ecliptic(Astronomy.GeoVector(body as Astronomy.Body, t2, true));

    let diff = pos1.elon - pos2.elon;
    if (diff < -300) diff += 360;
    if (diff > 300) diff -= 360;

    return diff < 0;
};

// Aspect Calculation
const calculateAspects = (planets: PlanetPosition[]): AspectData[] => {
    const aspects: AspectData[] = [];

    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const p1 = planets[i];
            const p2 = planets[j];

            let diff = Math.abs(p1.totalDegree - p2.totalDegree);
            if (diff > 180) diff = 360 - diff;

            let orb = 0;
            let type: AspectData['type'] | null = null;

            if (diff <= 8) { type = "Conjunction"; orb = 8; }
            else if (diff >= 54 && diff <= 66) { type = "Sextile"; orb = 6; }
            else if (diff >= 82 && diff <= 98) { type = "Square"; orb = 8; }
            else if (diff >= 112 && diff <= 128) { type = "Trine"; orb = 8; }
            else if (diff >= 172 && diff <= 180) { type = "Opposition"; orb = 8; }

            if (type) {
                const actualOrb = Math.abs(diff - (type === "Conjunction" ? 0 : type === "Sextile" ? 60 : type === "Square" ? 90 : type === "Trine" ? 120 : 180));

                const isMajor = (p1.planet === "Sun" || p1.planet === "Moon" || p1.planet === "Ascendant" ||
                    p2.planet === "Sun" || p2.planet === "Moon" || p2.planet === "Ascendant");

                const p1Theme = PLANET_THEMES[p1.planet] || "Enerji";
                const p2Theme = PLANET_THEMES[p2.planet] || "Enerji";
                let interpretation = "";

                const isSunMoon = (p1.planet === "Sun" && p2.planet === "Moon") || (p1.planet === "Moon" && p2.planet === "Sun");
                const isSunAsc = (p1.planet === "Sun" && p2.planet === "Ascendant") || (p1.planet === "Ascendant" && p2.planet === "Sun");
                const isMoonAsc = (p1.planet === "Moon" && p2.planet === "Ascendant") || (p1.planet === "Ascendant" && p2.planet === "Moon");
                const isSunMars = (p1.planet === "Sun" && p2.planet === "Mars") || (p1.planet === "Mars" && p2.planet === "Sun");
                const isMoonVenus = (p1.planet === "Moon" && p2.planet === "Venus") || (p1.planet === "Venus" && p2.planet === "Moon");

                if (type === "Conjunction") {
                    if (isSunMoon) interpretation = "Kişiliğiniz ve duygularınız bir bütün. Ne istediğini bilen ve duygusal olarak tutarlı birisiniz.";
                    else if (isSunAsc) interpretation = "Kendinizi olduğunuz gibi yansıtıyorsunuz. Maskeniz ve özünüz birdir.";
                    else if (isMoonAsc) interpretation = "Duygularınızı gizleyemezsiniz. İç dünyanız yüzünüze ve tavırlarınıza anında yansır.";
                    else if (isSunMars) interpretation = "İnanılmaz bir enerji ve irade gücüne sahipsiniz. Liderlik vasfı baskındır.";
                    else if (isMoonVenus) interpretation = "Doğal bir zarafet ve çekiciliğiniz var. İnsanlarla bağ kurmakta ustasınız.";
                    else interpretation = `${p1.planetNameTR} (${p1Theme}) ve ${p2.planetNameTR} (${p2Theme}) güçlerini birleştiriyor. Enerjiler içiçe geçiyor.`;
                }
                else if (type === "Opposition") {
                    if (isSunMoon) interpretation = "İstekleriniz ve ihtiyaçlarınız arasında çekişme var. Mantık ve duygu dengesini bulmalısınız.";
                    else if (isSunAsc) interpretation = "İkili ilişkilerde kendinizi daha iyi tanırsınız. Başkaları sizin aynanızdır.";
                    else if (isSunMars) interpretation = "Agresif bir enerjiyle karşılaşabilirsiniz. Rekabetçi doğanızı dengelemeyi öğrenmelisiniz.";
                    else interpretation = `${p1.planetNameTR} ve ${p2.planetNameTR} karşıt kutuplarda. ${p1Theme} ile ${p2Theme} arasında denge kurmak hayat dersinizdir.`;
                }
                else if (type === "Square") {
                    if (isSunMoon) interpretation = "İçsel bir huzursuzluk sizi harekete geçirir. Egonuz ve duygularınız çatışarak sizi büyütür.";
                    else if (isSunMars) interpretation = "Dürtüsel davranışlara dikkat. Enerjinizi yapıcı kullanmayı öğrenmek zorundasınız.";
                    else interpretation = `${p1.planetNameTR} ve ${p2.planetNameTR} arasında sürtünme var. ${p1Theme} konusunda zorluklarla gelen bir gelişim söz konusu.`;
                }
                else if (type === "Trine") {
                    if (isSunMoon) interpretation = "İçsel huzur ve doğal bir dengeye sahipsiniz. Kendinizle barışıksınız.";
                    else if (isMoonVenus) interpretation = "Sanatsal yetenekler ve sevgi dolu bir doğa. Sosyal hayatta şanslısınız.";
                    else interpretation = `${p1.planetNameTR} ve ${p2.planetNameTR} uyum içinde. ${p1Theme} ve ${p2Theme} alanlarında doğuştan gelen yetenekleriniz var.`;
                }
                else if (type === "Sextile") {
                    interpretation = `${p1.planetNameTR} ve ${p2.planetNameTR} işbirliği içinde. ${p1Theme} yeteneklerini geliştirmek için fırsatlar yakalayabilirsiniz.`;
                }

                aspects.push({
                    planet1: p1.planetNameTR,
                    planet2: p2.planetNameTR,
                    type: type,
                    angle: parseFloat(diff.toFixed(1)),
                    orb: parseFloat(actualOrb.toFixed(1)),
                    interpretation,
                    isMajor
                });
            }
        }
    }
    return aspects.sort((a, b) => a.orb - b.orb);
};

// Calculate Transits: Current Planets vs Natal Planets
const calculateTransits = (natalPlanets: PlanetPosition[]): TransitData[] => {
    const transits: TransitData[] = [];
    const now = Astronomy.MakeTime(new Date());

    const transitBodies = ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    const natalTargets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant"];

    for (const tBody of transitBodies) {
        const vec = Astronomy.GeoVector(tBody as Astronomy.Body, now, true);
        const ecliptic = Astronomy.Ecliptic(vec);
        const transitDegree = ecliptic.elon;

        for (const nPlanet of natalPlanets) {
            if (!natalTargets.includes(nPlanet.planet)) continue;

            let diff = Math.abs(transitDegree - nPlanet.totalDegree);
            if (diff > 180) diff = 360 - diff;

            let type: AspectData['type'] | null = null;
            if (diff <= 3) type = "Conjunction";
            else if (diff >= 87 && diff <= 93) type = "Square";
            else if (diff >= 117 && diff <= 123) type = "Trine";
            else if (diff >= 177 && diff <= 180) type = "Opposition";

            if (type) {
                const transitName = PLANET_INFO[tBody];
                const natalName = nPlanet.planetNameTR;
                let interpretation = "";

                if (type === "Conjunction") interpretation = `Transit ${transitName}, doğum ${natalName} ile kavuşumda. Yeni bir döngü ve yoğun enerji birleşimi.`;
                else if (type === "Square") interpretation = `Transit ${transitName}, doğum ${natalName} ile kare açıda. Zorluklar yoluyla eyleme geçme zorunluluğu.`;
                else if (type === "Trine") interpretation = `Transit ${transitName}, doğum ${natalName} ile üçgen açıda. Akışkan ve destekleyici enerjiler.`;
                else if (type === "Opposition") interpretation = `Transit ${transitName}, doğum ${natalName} ile karşıt açıda. Farkındalık ve ilişki dinamiklerinde denge sınavı.`;

                transits.push({
                    transitPlanet: transitName,
                    natalPlanet: natalName,
                    type,
                    orb: parseFloat(diff.toFixed(1)),
                    interpretation
                });
            }
        }
    }
    return transits;
};

// --- MOON PHASE ---
export const getCurrentMoonPhase = (): { phase: string; image: string; illumination: number } => {
    const time = Astronomy.MakeTime(new Date());
    const phaseDeg = Astronomy.MoonPhase(time);
    const illum = Math.round(Astronomy.Illumination(Astronomy.Body.Moon, time).phase_fraction * 100);

    // 0 = New Moon, 90 = First Quarter, 180 = Full, 270 = Third Quarter
    if (phaseDeg < 22 || phaseDeg >= 338) return { phase: "Yeni Ay", image: "icons8-new-moon-100.png", illumination: illum };
    if (phaseDeg < 68) return { phase: "Hilal (Büyüyen)", image: "icons8-waxing-crescent-100.png", illumination: illum };
    if (phaseDeg < 112) return { phase: "İlk Dördün", image: "icons8-first-quarter-100.png", illumination: illum };
    if (phaseDeg < 158) return { phase: "Şişkin Ay (Büyüyen)", image: "icons8-waxing-gibbous-100.png", illumination: illum };
    if (phaseDeg < 202) return { phase: "Dolunay", image: "icons8-full-moon-100.png", illumination: illum };
    if (phaseDeg < 248) return { phase: "Şişkin Ay (Küçülen)", image: "icons8-waning-gibbous-100.png", illumination: illum };
    if (phaseDeg < 292) return { phase: "Son Dördün", image: "icons8-last-quarter-100.png", illumination: illum };
    return { phase: "Balsamik Ay (Küçülen)", image: "icons8-waning-crescent-100.png", illumination: illum };
};

export const performCalculations = (input: UserInput) => {
    // 1. Numerology
    const numerology: NumerologyData = {
        lifePath: calculateLifePath(input.birthDate),
        destiny: calculateDestinyNumber(input.name),
        soulUrge: calculateDestinyNumber(input.name.replace(/[^aeiou]/gi, ''))
    };

    // 2. Astronomy Setup — Interpret birth time as Turkey local time
    // Turkey has been UTC+3 year-round since Oct 30, 2016
    // Before that: UTC+2 (winter, last Sun Oct → last Sun Mar) / UTC+3 (summer)
    const dateString = `${input.birthDate}T${input.birthTime}:00`;

    // Determine Turkey UTC offset for this date
    const year = parseInt(input.birthDate.split('-')[0]);
    const month = parseInt(input.birthDate.split('-')[1]);
    let turkeyOffsetHours = 3; // Default: UTC+3 (after 2016)
    if (year < 2016 || (year === 2016 && month < 11)) {
        // Before Nov 2016: simple winter/summer check
        // Winter (Nov-Mar) = UTC+2, Summer (Apr-Oct) = UTC+3
        if (month >= 11 || month <= 3) {
            turkeyOffsetHours = 2;
        } else {
            turkeyOffsetHours = 3;
        }
    }

    // Create a UTC date by subtracting Turkey offset from the local time
    const [bHours, bMinutes] = input.birthTime.split(':').map(Number);
    const [bYear, bMonth, bDay] = input.birthDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(bYear, bMonth - 1, bDay, bHours - turkeyOffsetHours, bMinutes, 0));

    if (isNaN(dateObj.getTime())) {
        throw new Error("Geçersiz Tarih/Saat formatı");
    }

    const lat = parseFloat(input.latitude) || 0;
    const lng = parseFloat(input.longitude) || 0;
    const astroTime = Astronomy.MakeTime(dateObj);

    // 3. Calculate Ascendant (Rising Sign)
    const siderealTime = Astronomy.SiderealTime(astroTime);
    const lst = siderealTime + (lng / 15.0);
    const ramc = (lst * 15.0) * (Math.PI / 180.0);
    const obliquityDeg = 23.4392911;
    const epsilon = obliquityDeg * (Math.PI / 180.0);
    const latRad = lat * (Math.PI / 180.0);

    const y = Math.cos(ramc);
    const x = -Math.sin(ramc) * Math.cos(epsilon) - Math.tan(latRad) * Math.sin(epsilon);

    let ascLonRad = Math.atan2(y, x);
    let ascLonDeg = (ascLonRad * 180.0 / Math.PI);
    if (ascLonDeg < 0) ascLonDeg += 360;

    const risingData = getZodiacFromLongitude(ascLonDeg);

    // 4. Calculate Planets
    const bodies = [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
    ];

    const planets: PlanetPosition[] = bodies.map(body => {
        const vec = Astronomy.GeoVector(body as Astronomy.Body, astroTime, true);
        const ecliptic = Astronomy.Ecliptic(vec);
        const zodiac = getZodiacFromLongitude(ecliptic.elon);

        return {
            planet: body,
            planetNameTR: PLANET_INFO[body] || body,
            sign: zodiac.sign,
            degree: Math.round(zodiac.degree * 100) / 100,
            totalDegree: ecliptic.elon,
            house: calculateHouse(zodiac.signIndex, risingData.signIndex),
            retrograde: isRetrograde(body, dateObj)
        };
    });

    const sun = planets.find(p => p.planet === "Sun")!;
    const moon = planets.find(p => p.planet === "Moon")!;
    const rising: PlanetPosition = {
        planet: "Ascendant",
        planetNameTR: "Yükselen",
        sign: risingData.sign,
        degree: Math.round(risingData.degree * 100) / 100,
        totalDegree: ascLonDeg,
        house: 1,
        retrograde: false
    };

    const allPoints = [...planets, rising];

    // 5. Generate House List
    const houses: HouseData[] = [];
    const signs = [
        "Aries", "Taurus", "Gemini", "Cancer",
        "Leo", "Virgo", "Libra", "Scorpio",
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    for (let i = 0; i < 12; i++) {
        const currentSignIndex = (risingData.signIndex + i) % 12;
        houses.push({
            houseNumber: i + 1,
            sign: signs[currentSignIndex],
            meaning: HOUSE_MEANINGS[i + 1]
        });
    }

    // 6. Calculate Aspects
    const aspects = calculateAspects(allPoints);

    // 7. Calculate Transits
    const transits = calculateTransits(allPoints);

    const astrology = {
        sun,
        moon,
        rising,
        planets,
        houses,
        aspects,
        transits,
        bigThreeSummary: `${ZODIAC_DATA[sun.sign].name} Güneş, ${ZODIAC_DATA[moon.sign].name} Ay, ${ZODIAC_DATA[rising.sign].name} Yükselen`
    };

    return { astrology, numerology };
};
