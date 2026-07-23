import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;
export interface Option { id: string; label: string; icon: IconName }

export const TOTAL_ONBOARDING_STEPS = 6;

export const GENDER_OPTIONS: Option[] = [
    { id: 'kadin', label: 'Kadın', icon: 'female-outline' },
    { id: 'erkek', label: 'Erkek', icon: 'male-outline' },
    { id: 'non-binary', label: 'Non-Binary', icon: 'infinite-outline' },
    { id: 'trans-kadin', label: 'Trans Kadın', icon: 'transgender-outline' },
    { id: 'trans-erkek', label: 'Trans Erkek', icon: 'transgender-outline' },
    { id: 'gender-fluid', label: 'Gender Fluid', icon: 'water-outline' },
    { id: 'diger', label: 'Diğer', icon: 'ellipse-outline' },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' },
];

export const RELATIONSHIP_OPTIONS: Option[] = [
    { id: 'bekar', label: 'Bekar', icon: 'person-outline' },
    { id: 'iliskide', label: 'İlişkide', icon: 'heart-outline' },
    { id: 'nisanli', label: 'Nişanlı', icon: 'diamond-outline' },
    { id: 'evli', label: 'Evli', icon: 'heart-circle-outline' },
    { id: 'ayrilik-surecinde', label: 'Ayrılık Sürecinde', icon: 'heart-dislike-outline' },
    { id: 'karmasik', label: 'Karmaşık', icon: 'help-circle-outline' },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' },
];

export const WORK_OPTIONS: Option[] = [
    { id: 'ogrenci', label: 'Öğrenci', icon: 'school-outline' },
    { id: 'calisan', label: 'Çalışan', icon: 'briefcase-outline' },
    { id: 'serbest', label: 'Serbest Meslek', icon: 'rocket-outline' },
    { id: 'girisimci', label: 'Girişimci', icon: 'bulb-outline' },
    { id: 'is-ariyor', label: 'İş Arıyor', icon: 'search-outline' },
    { id: 'emekli', label: 'Emekli', icon: 'sunny-outline' },
    { id: 'ev-hanimi', label: 'Ev Hanımı', icon: 'home-outline' },
    { id: 'belirtmek-istemiyorum', label: 'Belirtmek İstemiyorum', icon: 'eye-off-outline' },
];

export const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

// Cleaned Turkish city list ('Adalet' bogus entry removed, deduped, sorted).
export const TURKISH_CITIES = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara',
    'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman',
    'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne',
    'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
    'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
    'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri',
    'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya',
    'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde',
    'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
    'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak',
    'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

/** Days in a given 1-based month/year, handling leap years. */
export function daysInMonth(month1: number, year: number): number {
    return new Date(year, month1, 0).getDate();
}
