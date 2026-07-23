import { SignData, Element, Modality } from './types';

export const PLANET_INFO: Record<string, string> = {
    Sun: "Güneş",
    Moon: "Ay",
    Mercury: "Merkür",
    Venus: "Venüs",
    Mars: "Mars",
    Jupiter: "Jüpiter",
    Saturn: "Satürn",
    Uranus: "Uranüs",
    Neptune: "Neptün",
    Pluto: "Plüton",
    Ascendant: "Yükselen"
};

export const PLANET_SYMBOLS: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇",
    Ascendant: "Asc"
};

export const PLANET_THEMES: Record<string, string> = {
    Sun: "Ego ve Yaşam Enerjisi",
    Moon: "Duygusal İhtiyaçlar ve İç Dünya",
    Mercury: "Zihin, İletişim ve Karar Mekanizması",
    Venus: "Sevgi, Değerler ve İlişkiler",
    Mars: "Eylem, Arzu ve Mücadele Gücü",
    Jupiter: "Büyüme, İnanç ve Şans",
    Saturn: "Disiplin, Sınırlar ve Korkular",
    Uranus: "Yenilik, Özgürlük ve İsyan",
    Neptune: "Hayaller, Sezgi ve İllüzyon",
    Pluto: "Dönüşüm, Güç ve Yeniden Doğuş",
    Ascendant: "Hayata Bakış ve Dış Görünüş"
};

export const NATAL_RETROGRADE_MEANINGS: Record<string, string> = {
    Mercury: "Düşüncelerinizi ifade etmeden önce defalarca süzgeçten geçirirsiniz. İçsel diyaloglarınız çok yoğundur ve geçmişi analiz etme eğilimindesiniz.",
    Venus: "İlişkilerde değer duygunuzu dışarıdan değil, içsel olarak bulmanız gerekir. Geçmişten gelen karmik ilişki kalıplarını çözmeye yatkınsınız.",
    Mars: "Öfkenizi ve arzularınızı içinize atma eğilimindesiniz. Eyleme geçmeden önce çok fazla strateji yapar, enerjinizi içeride biriktirirsiniz.",
    Jupiter: "Kendi inanç sisteminizi, toplumsal dogmalardan bağımsız olarak, tamamen kendi içsel deneyimlerinizle oluşturursunuz.",
    Saturn: "Otorite figürleriyle ilgili içsel sınavlar ve kendine karşı aşırı katı bir disiplin anlayışı getirebilir. Kendi kendinizin öğretmeni olmalısınız.",
    Uranus: "Özgürlük anlayışınız isyankar bir dışavurumdan çok, içsel bir devrim niteliğindedir. Değişimi önce kendi zihninizde yaşarsınız.",
    Neptune: "Hayaller ve gerçeklik arasındaki sınır iç dünyanızda bulanıklaşabilir. Güçlü bir sezgiye ve zengin bir hayal dünyasına sahipsiniz.",
    Pluto: "Güç arzusu ve dönüşüm ihtiyacı çok derinlerde yaşanır. Krizleri kendi başınıza çözme ve küllerinizden doğma yeteneğiniz yüksektir."
};

export const ZODIAC_SYMBOLS: string[] = [
    "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"
];

export const HOUSE_MEANINGS: Record<number, string> = {
    1: "Benlik ve Dış Görünüş: Dünyaya taktığınız maske, fiziksel bedeniniz ve hayata ilk yaklaşımınız.",
    2: "Değerler ve Kaynaklar: Para, maddi varlıklar, öz değer ve sahip olduklarınıza verdiğiniz önem.",
    3: "İletişim ve Yakın Çevre: Düşünme şekliniz, kardeşler, komşular ve kısa yolculuklar.",
    4: "Yuva ve Kökler: Aile, ebeveynler, iç dünyanız, duygusal temelleriniz ve kökeniniz.",
    5: "Yaratıcılık ve Aşk: Kendini ifade etme, romantizm, çocuklar, hobiler ve risk alma.",
    6: "Hizmet ve Sağlık: Günlük rutinler, çalışma ortamı, sağlık alışkanlıkları ve sorumluluklar.",
    7: "İlişkiler ve Ortaklıklar: Evlilik, iş ortaklıkları, açık düşmanlar ve 'diğer' kişiler.",
    8: "Dönüşüm ve Paylaşım: Ortak kaynaklar, miras, cinsellik, ölüm ve yeniden doğum krizleri.",
    9: "Felsefe ve Keşif: Yüksek öğrenim, inanç sistemleri, uzun yolculuklar ve hayatın anlamı.",
    10: "Kariyer ve Statü: Toplumsal imaj, hedefler, başarı, otorite figürleri ve mirasımız.",
    11: "Topluluk ve Gelecek: Arkadaşlar, sosyal gruplar, umutlar, hayaller ve kolektif hedefler.",
    12: "Bilinçaltı ve Bitişler: Gizli konular, rüyalar, inziva, karma ve ruhsal çözülmeler."
};

export const ASPECT_MEANINGS: Record<string, { name: string; symbol: string; desc: string }> = {
    Conjunction: { name: "Kavuşum", symbol: "☌", desc: "Güç birliği." },
    Opposition: { name: "Karşıt", symbol: "☍", desc: "Gerilim ve denge." },
    Square: { name: "Kare", symbol: "□", desc: "Çatışma ve eylem." },
    Trine: { name: "Üçgen", symbol: "△", desc: "Akış ve yetenek." },
    Sextile: { name: "Sekstil", symbol: "⚹", desc: "Fırsat ve destek." }
};

export const RETROGRADE_CALENDAR_2025 = [
    {
        planet: "Merkür",
        period: "15 Mart - 7 Nisan 2025",
        sign: "Koç / Balık",
        note: "İletişim aksaklıklarına, yanlış anlaşılmalara ve teknolojik arızalara dikkat. Yeni sözleşme imzalamayın.",
        type: "warning"
    },
    {
        planet: "Venüs",
        period: "2 Mart - 13 Nisan 2025",
        sign: "Koç / Balık",
        note: "Eski aşklar dönebilir. Estetik operasyonlardan ve büyük yatırımlardan kaçının. İlişkilerde değer sorgulaması.",
        type: "alert"
    },
    {
        planet: "Mars",
        period: "6 Aralık 2024 - 24 Şubat 2025",
        sign: "Aslan / Yengeç",
        note: "Enerjiniz düşük olabilir. Pasif agresif tutumlara dikkat. Öfke kontrolü ve ailevi konularda sabır gerekir.",
        type: "danger"
    },
    {
        planet: "Merkür",
        period: "18 Temmuz - 11 Ağustos 2025",
        sign: "Aslan",
        note: "Egonuzun iletişim dilinize yansımasına dikkat edin. Yanlışlıkla gurur kırıcı sözler söylemekten kaçının.",
        type: "warning"
    },
    {
        planet: "Jüpiter",
        period: "11 Kasım 2025 - Mart 2026",
        sign: "Yengeç",
        note: "İçsel büyüme dönemi. Dış dünyadaki fırsatlardan çok iç dünyanızdaki inançları büyütmeye odaklanın.",
        type: "info"
    }
];

export const TURKISH_CITIES = [
    { name: "Adana", lat: 37.0000, lon: 35.3213 },
    { name: "Adıyaman", lat: 37.7648, lon: 38.2786 },
    { name: "Afyonkarahisar", lat: 38.7507, lon: 30.5567 },
    { name: "Ağrı", lat: 39.7191, lon: 43.0503 },
    { name: "Amasya", lat: 40.6499, lon: 35.8353 },
    { name: "Ankara", lat: 39.9334, lon: 32.8597 },
    { name: "Antalya", lat: 36.8969, lon: 30.7133 },
    { name: "Artvin", lat: 41.1828, lon: 41.8183 },
    { name: "Aydın", lat: 37.8444, lon: 27.8458 },
    { name: "Balıkesir", lat: 39.6484, lon: 27.8826 },
    { name: "Bilecik", lat: 40.1451, lon: 29.9799 },
    { name: "Bingöl", lat: 38.8853, lon: 40.4983 },
    { name: "Bitlis", lat: 38.4006, lon: 42.1095 },
    { name: "Bolu", lat: 40.7350, lon: 31.6061 },
    { name: "Burdur", lat: 37.7204, lon: 30.2908 },
    { name: "Bursa", lat: 40.1885, lon: 29.0610 },
    { name: "Çanakkale", lat: 40.1553, lon: 26.4142 },
    { name: "Çankırı", lat: 40.6013, lon: 33.6134 },
    { name: "Çorum", lat: 40.5506, lon: 34.9556 },
    { name: "Denizli", lat: 37.7765, lon: 29.0864 },
    { name: "Diyarbakır", lat: 37.9144, lon: 40.2306 },
    { name: "Edirne", lat: 41.6768, lon: 26.5603 },
    { name: "Elazığ", lat: 38.6810, lon: 39.2264 },
    { name: "Erzincan", lat: 39.7500, lon: 39.5000 },
    { name: "Erzurum", lat: 39.9043, lon: 41.2679 },
    { name: "Eskişehir", lat: 39.7767, lon: 30.5206 },
    { name: "Gaziantep", lat: 37.0662, lon: 37.3833 },
    { name: "Giresun", lat: 40.9128, lon: 38.3895 },
    { name: "Gümüşhane", lat: 40.4600, lon: 39.4718 },
    { name: "Hakkâri", lat: 37.5833, lon: 43.7333 },
    { name: "Hatay", lat: 36.4018, lon: 36.3498 },
    { name: "Isparta", lat: 37.7648, lon: 30.5566 },
    { name: "Mersin", lat: 36.8000, lon: 34.6333 },
    { name: "İstanbul", lat: 41.0082, lon: 28.9784 },
    { name: "İzmir", lat: 38.4192, lon: 27.1287 },
    { name: "Kars", lat: 40.6172, lon: 43.0974 },
    { name: "Kastamonu", lat: 41.3887, lon: 33.7827 },
    { name: "Kayseri", lat: 38.7312, lon: 35.4787 },
    { name: "Kırklareli", lat: 41.7333, lon: 27.2167 },
    { name: "Kırşehir", lat: 39.1425, lon: 34.1709 },
    { name: "Kocaeli", lat: 40.8533, lon: 29.8815 },
    { name: "Konya", lat: 37.8667, lon: 32.4833 },
    { name: "Kütahya", lat: 39.4167, lon: 29.9833 },
    { name: "Malatya", lat: 38.3552, lon: 38.3095 },
    { name: "Manisa", lat: 38.6191, lon: 27.4289 },
    { name: "Kahramanmaraş", lat: 37.5858, lon: 36.9371 },
    { name: "Mardin", lat: 37.3212, lon: 40.7245 },
    { name: "Muğla", lat: 37.2153, lon: 28.3636 },
    { name: "Muş", lat: 38.7432, lon: 41.4910 },
    { name: "Nevşehir", lat: 38.6244, lon: 34.7144 },
    { name: "Niğde", lat: 37.9667, lon: 34.6833 },
    { name: "Ordu", lat: 40.9839, lon: 37.8764 },
    { name: "Rize", lat: 41.0201, lon: 40.5234 },
    { name: "Sakarya", lat: 40.7569, lon: 30.3783 },
    { name: "Samsun", lat: 41.2928, lon: 36.3313 },
    { name: "Siirt", lat: 37.9333, lon: 41.9500 },
    { name: "Sinop", lat: 42.0231, lon: 35.1531 },
    { name: "Sivas", lat: 39.7477, lon: 37.0179 },
    { name: "Tekirdağ", lat: 40.9833, lon: 27.5167 },
    { name: "Tokat", lat: 40.3167, lon: 36.5500 },
    { name: "Trabzon", lat: 41.0015, lon: 39.7178 },
    { name: "Tunceli", lat: 39.1079, lon: 39.5401 },
    { name: "Şanlıurfa", lat: 37.1591, lon: 38.7969 },
    { name: "Uşak", lat: 38.6823, lon: 29.4082 },
    { name: "Van", lat: 38.4891, lon: 43.4089 },
    { name: "Yozgat", lat: 39.8181, lon: 34.8147 },
    { name: "Zonguldak", lat: 41.4564, lon: 31.7987 },
    { name: "Aksaray", lat: 38.3687, lon: 34.0370 },
    { name: "Bayburt", lat: 40.2552, lon: 40.2249 },
    { name: "Karaman", lat: 37.1759, lon: 33.2287 },
    { name: "Kırıkkale", lat: 39.8468, lon: 33.5153 },
    { name: "Batman", lat: 37.8812, lon: 41.1351 },
    { name: "Şırnak", lat: 37.5164, lon: 42.4611 },
    { name: "Bartın", lat: 41.6344, lon: 32.3375 },
    { name: "Ardahan", lat: 41.1105, lon: 42.7022 },
    { name: "Iğdır", lat: 39.9196, lon: 44.0459 },
    { name: "Yalova", lat: 40.6500, lon: 29.2667 },
    { name: "Karabük", lat: 41.2061, lon: 32.6204 },
    { name: "Kilis", lat: 36.7184, lon: 37.1212 },
    { name: "Osmaniye", lat: 37.0742, lon: 36.2467 },
    { name: "Düzce", lat: 40.8438, lon: 31.1565 }
];

export const ZODIAC_DATA: Record<string, SignData> = {
    Aries: {
        name: "Koç",
        element: Element.Fire,
        modality: Modality.Cardinal,
        ruler: "Mars",
        mythology: { greek: "Ares", archetype: "Kahraman / Savaşçı" },
        tarot: { card: "İmparator", theme: "Otorite ve İrade" },
        tengriOracle: {
            cardName: "Erlik Han",
            keywords: ["Dönüşüm", "Yeraltı Gücü", "Yeniden Doğuş", "Gölgeyle Yüzleşme"],
            symbolism: "Kara Boğa ve yeraltı aleminin Demir Sarayı.",
            description: "Erlik Han, ayrılığın gerekli gücünü ve bilinçaltının ham kudretini temsil eder. Tıpkı Ares'in savaşa atılması gibi, Erlik de derinlerin ruhlarına hükmeder. Bu kart, en büyük gücünün kendi gölgelerinle yüzleşmekten geleceğini işaret eder. Eski yapıları yıkıp yenisini inşa edebilecek zorlu bir iradeye sahipsin.",
            shadow: "Gücü hükmetmek için kullanmak; kin tutmak ve bırakamamak."
        }
    },
    Taurus: {
        name: "Boğa",
        element: Element.Earth,
        modality: Modality.Fixed,
        ruler: "Venüs",
        mythology: { greek: "Afrodit", archetype: "Aşık / İnşa Edici" },
        tarot: { card: "Aziz", theme: "Gelenek ve Bilgelik" },
        tengriOracle: {
            cardName: "Umay Ana",
            keywords: ["Bereket", "Yaşamı Koruma", "Bolluk", "Kutsal Toprak"],
            symbolism: "Beyaz Kuğu ve Hayat Ağacı.",
            description: "Umay Ana, bereketin ve çocukların/yaratımların koruyucusu olan şefkatli ana tanrıçadır. Boğa burcu gibi, o da ruhsal enerjiyi somut gerçekliğe kökleyerek fiziksel alemi yönetir. Bu kart, yaşam amacının büyümeyi beslemek, istikrar yaratmak ve doğanın kutsallığını onurlandırmak üzerine kurulu olduğunu gösterir.",
            shadow: "Maddi konfora aşırı düşkünlük; sahiplenicilik."
        }
    },
    Gemini: {
        name: "İkizler",
        element: Element.Air,
        modality: Modality.Mutable,
        ruler: "Merkür",
        mythology: { greek: "Hermes", archetype: "Büyücü / Hilebaz" },
        tarot: { card: "Aşıklar", theme: "Seçim ve İkilik" },
        tengriOracle: {
            cardName: "Mergen",
            keywords: ["Bilgelik", "Okçuluk", "Odak", "Zeka"],
            symbolism: "Beyaz At ve Hakikat Yayı.",
            description: "Mergen, bilgelik ve öngörü tanrısıdır, genellikle usta bir okçu olarak tasvir edilir. İkizler gibi, düşüncenin hızını ve kaosun ortasında hakikat hedefini vurma yeteneğini temsil eder. Bu kart, farklı dünyalar arasında köprü kurabilen ve karmaşık fikirleri hassasiyetle iletebilen keskin bir zihne işaret eder.",
            shadow: "Dağınık enerji; kararsızlığa yol açan ikilik."
        }
    },
    Cancer: {
        name: "Yengeç",
        element: Element.Water,
        modality: Modality.Cardinal,
        ruler: "Ay",
        mythology: { greek: "Demeter", archetype: "Bakıcı / Anne" },
        tarot: { card: "Savaş Arabası", theme: "İrade ve Koruma" },
        tengriOracle: {
            cardName: "Asena",
            keywords: ["Atasal Rehberlik", "Sezgi", "Hayatta Kalma", "Sadakat"],
            symbolism: "Demir dağdan çıkış yolunu gösteren Mavi Kurt Ana.",
            description: "Asena, ataları hayata döndüren ve onları özgürlüğe kavuşturan dişi kurttur. Yengeç'in koruyucu, sezgisel ve inatçı ruhunu somutlaştırır. Bu kart, soyağacına derin bir bağ ve 'sürünü' koruma içgüdüsünü ortaya çıkarır. Sezgin senin en güçlü silahındır; aydınlattığı yola güven.",
            shadow: "Savunmacılık; tehdit altında duygusal dalgalanmalar."
        }
    },
    Leo: {
        name: "Aslan",
        element: Element.Fire,
        modality: Modality.Fixed,
        ruler: "Güneş",
        mythology: { greek: "Apollon", archetype: "Hükümdar / Sanatçı" },
        tarot: { card: "Güç", theme: "İçsel Güç" },
        tengriOracle: {
            cardName: "Gök Tengri",
            keywords: ["Sonsuz Mavi Gök", "Egemenlik", "İlahi Düzen", "Işıltı"],
            symbolism: "Tüm varoluşu kaplayan Sonsuz Mavi Gök.",
            description: "Gök Tengri, evrenin sarsılmaz düzenini ve hayat veren güneşi temsil eden yüce tanrıdır. Bu, Aslan'ın asil doğasıyla örtüşür. Bu kart, liderlik ve görünürlük yetkisi verir. Parlamak, kaosu düzene sokmak ve sonsuz gökyüzünün altında onur ve asaletle yaşamak için buradasın.",
            shadow: "Kibir; gökyüzünün sadece yönetmediğini, aynı zamanda yeryüzüne hizmet ettiğini unutmak."
        }
    },
    Virgo: {
        name: "Başak",
        element: Element.Earth,
        modality: Modality.Mutable,
        ruler: "Merkür",
        mythology: { greek: "Athena", archetype: "Bilge / Şifacı" },
        tarot: { card: "Ermiş", theme: "İçgörü" },
        tengriOracle: {
            cardName: "Od Ana",
            keywords: ["Ocak Ateşi", "Arınma", "Hizmet", "Simya"],
            symbolism: "Yurt'un merkezindeki Kutsal Ateş.",
            description: "Od Ana, yıkım değil, evin sıcaklığı ve dönüşümün (pişirme/arıtma) aracı olan Ateş Ruhu'dur. Başak gibi, varoluşu sürdüren günlük yaşamın detaylarıyla ilgilenir. Bu kart, iyileştirme, organize etme ve başkaları için kutsal bir alan yaratmak adına çevreyi arındırma yeteneğine işaret eder.",
            shadow: "Mükemmeliyetçilik; başkalarına hizmet ederken kendini tüketmek."
        }
    },
    Libra: {
        name: "Terazi",
        element: Element.Air,
        modality: Modality.Cardinal,
        ruler: "Venüs",
        mythology: { greek: "Hera", archetype: "Diplomat / Ortak" },
        tarot: { card: "Adalet", theme: "Denge ve Hakikat" },
        tengriOracle: {
            cardName: "Ayzıt",
            keywords: ["Güzellik", "Uyum", "Ruh Kayıtları", "Zarafet"],
            symbolism: "Gümüş Ayna ve Kuğu.",
            description: "Ayzıt, insanların eylemlerini kaydeden güzellik tanrıçasıdır. Zarafet ve incelik getirir, Terazi'nin uyum arayışıyla rezonansa girer. Bu kart, senin bir denge koruyucusu olduğunu, dünyadaki estetik ve ahlaki güzelliği görebildiğini gösterir. Uyumsuzluğun olduğu yerde dengeyi yeniden sağlarsın.",
            shadow: "Kararsızlık; derinlik yerine dış görünüşe öncelik vermek."
        }
    },
    Scorpio: {
        name: "Akrep",
        element: Element.Water,
        modality: Modality.Fixed,
        ruler: "Plüton",
        mythology: { greek: "Hades", archetype: "Simyacı / Dönüştürücü" },
        tarot: { card: "Ölüm", theme: "Yeniden Doğuş" },
        tengriOracle: {
            cardName: "Körmös",
            keywords: ["Ruhlar", "Gizem", "Saklı Gerçekler", "Ruh Rehberi"],
            symbolism: "Yol ayrımlarındaki Görünmez Gözcüler.",
            description: "Körmösler, dünyalar arasında gezinen ruhlardır. Bu kart, Akrep'in başkalarının göremediğini görme yeteneğini temsil eder—gizli motifler, sırlar, yaşam ve ölüm arasındaki geçiş. Sen karanlıkta bir rehbersin, başkalarını dehşete düşüren gizemlerden korkmazsın.",
            shadow: "Manipülasyon; gölgelerde kaybolmak."
        }
    },
    Sagittarius: {
        name: "Yay",
        element: Element.Fire,
        modality: Modality.Mutable,
        ruler: "Jüpiter",
        mythology: { greek: "Zeus", archetype: "Kaşif / Filozof" },
        tarot: { card: "Denge", theme: "Sentez ve Ölçülülük" },
        tengriOracle: {
            cardName: "Tulpar",
            keywords: ["Hız", "Özgürlük", "Yükseliş", "Macera"],
            symbolism: "Altay Dağları üzerinde süzülen Kanatlı At.",
            description: "Tulpar, kahramanların büyük mesafeleri aşmasına yardım eden efsanevi kanatlı attır. Yay burcu gibi, bu arketip özgürlüğe, seyahate ve yüksek bilgiye duyulan sönmez susuzluğu simgeler. Bu kart, ruhunun kafese kapatılamayacağını; sınırları keşfetmek ve uzaklardan bilgelik getirmek için doğduğunu söyler.",
            shadow: "Huzursuzluk; sorumluluktan kaçmak."
        }
    },
    Capricorn: {
        name: "Oğlak",
        element: Element.Earth,
        modality: Modality.Cardinal,
        ruler: "Satürn",
        mythology: { greek: "Kronos", archetype: "Mimar / Baba" },
        tarot: { card: "Şeytan", theme: "Maddiyat ve Hırs" },
        tengriOracle: {
            cardName: "Kayra Han",
            keywords: ["Yüce Otorite", "Yapı", "Zaman", "Miras"],
            symbolism: "Göğün 17. Katı ve Altın Taht.",
            description: "Kayra Han, yaratılışın ilkel tanrısı ve en yüksek otoritedir. Oğlak burcunun hırsına uygun olarak, nihai yapıyı ve zamanın uzun vadeli görünümünü temsil eder. Bu kart, kalıcı miraslar inşa etme kaderine işaret eder. Gerçekliğin mimarısın, yönetmek için sabır ve disiplinle donatılmışsın.",
            shadow: "Katılık; kuralları şefkatin üzerinde tutmak."
        }
    },
    Aquarius: {
        name: "Kova",
        element: Element.Air,
        modality: Modality.Fixed,
        ruler: "Uranüs",
        mythology: { greek: "Prometheus", archetype: "İsyankar / Yenilikçi" },
        tarot: { card: "Yıldız", theme: "Umut ve İlham" },
        tengriOracle: {
            cardName: "Berk",
            keywords: ["Yıldırım", "Uyanış", "Ani Değişim", "İnovasyon"],
            symbolism: "Kutsal ağaca çarpan Işık Parıltısı.",
            description: "Berk, yıldırımın ruhunu temsil eder—ani, aydınlatıcı ve elektrikleyici. Bu, Kova'nın uyanış ve devrim enerjisiyle örtüşür. Bu kart, senin bir değişim katalizörü olduğunu gösterir. Daha evrimleşmiş bir geleceğe yol açmak için statükoyu bozan içgörü parıltıları getiriyorsun.",
            shadow: "Kopukluk; sadece kaos yaratmak için kaos çıkarmak."
        }
    },
    Pisces: {
        name: "Balık",
        element: Element.Water,
        modality: Modality.Mutable,
        ruler: "Neptün",
        mythology: { greek: "Poseidon", archetype: "Mistik / Hayalperest" },
        tarot: { card: "Ay", theme: "Sezgi ve İllüzyon" },
        tengriOracle: {
            cardName: "Ülgen",
            keywords: ["İyilik", "Rüyalar", "Kozmik Okyanus", "Şefkat"],
            symbolism: "Altın Kapı ve Kader Ağacı.",
            description: "Ülgen, iyiliğin, bolluğun ve üst alemlerin yardımsever tanrısıdır. Hayal gücünü ve şefkatli kalbi yönetir. Balık burcu gibi, Ülgen de bizi ilahi kaynağa bağlar. Bu kart, ruhsal düzlemlere derinden bağlı, evrensel sevgi ve sanatsal ilham için bir kanal görevi gören bir ruha işaret eder.",
            shadow: "Kaçış; sınır koyamama."
        }
    }
};
