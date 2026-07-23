# Valeria REST API Dokümantasyonu

> **Base URL:** `https://api.valeria.app/api`  
> **Auth:** JWT Bearer Token  
> **Format:** JSON  

---

## İçindekiler

1. [Kimlik Doğrulama (Auth)](#1-kimlik-doğrulama-auth)
2. [Profil](#2-profil)
3. [Entitlements (Krediler & XP)](#3-entitlements-krediler--xp)
4. [İçerikler (Content)](#4-i̇çerikler-content)
5. [Okumalar (Readings)](#5-okumalar-readings)
6. [Danışmanlar (Advisors)](#6-danışmanlar-advisors)
7. [Astroloji](#7-astroloji)
8. [Günlük Tarot](#8-günlük-tarot)
9. [Abonelikler (Subscriptions)](#9-abonelikler-subscriptions)
10. [Push Bildirimleri](#10-push-bildirimleri)
11. [Veri Modelleri](#11-veri-modelleri)
12. [Hata Kodları](#12-hata-kodları)

---

## Ortak Başlıklar

Tüm istekler için:

```
Content-Type: application/json
```

Korunan endpointler için (🔐 ile işaretli):

```
Authorization: Bearer <accessToken>
```

401 dönerse client otomatik olarak `/auth/refresh` ile token yeniler ve isteği tekrarlar.

---

## 1. Kimlik Doğrulama (Auth)

### `POST /auth/register`

Yeni kullanıcı kaydı oluşturur.

**Request Body:**

| Alan       | Tip      | Zorunlu | Açıklama           |
|------------|----------|---------|---------------------|
| `email`    | `string` | ✅      | Geçerli email adresi |
| `password` | `string` | ✅      | Minimum 6 karakter   |
| `name`     | `string` | ✅      | Ad Soyad             |

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "_id": "65a1b2c3d4e5f6...",
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "onboardingComplete": false
  }
}
```

---

### `POST /auth/login`

Mevcut kullanıcı girişi.

**Request Body:**

| Alan       | Tip      | Zorunlu | Açıklama |
|------------|----------|---------|----------|
| `email`    | `string` | ✅      | Email    |
| `password` | `string` | ✅      | Şifre    |

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "_id": "65a1b2c3d4e5f6...",
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "onboardingComplete": true
  }
}
```

---

### `POST /auth/apple`

Apple Sign-In ile kimlik doğrulama. Kullanıcı yoksa otomatik kayıt oluşturur.

**Request Body:**

| Alan      | Tip      | Zorunlu | Açıklama                     |
|-----------|----------|---------|-------------------------------|
| `appleId` | `string` | ✅      | Apple tarafından verilen ID   |
| `email`   | `string` | ❌      | Apple'dan gelen email         |
| `name`    | `string` | ❌      | Apple'dan gelen isim          |

**Response `200`:** Register/Login ile aynı format.

---

### `POST /auth/refresh`

Access token süresi dolduğunda yeni token çifti alır.

**Request Body:**

| Alan           | Tip      | Zorunlu | Açıklama     |
|----------------|----------|---------|---------------|
| `refreshToken` | `string` | ✅      | Refresh token |

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

---

## 2. Profil

### `GET /profile` 🔐

Giriş yapmış kullanıcının profil bilgilerini döner.

**Response `200`:**

```json
{
  "_id": "65a1b2c3d4e5f6...",
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "gender": "erkek",
  "birthDate": "1995-03-15T00:00:00.000Z",
  "birthTime": "14:30",
  "birthCity": "Istanbul",
  "birthCountry": "Türkiye",
  "relationshipStatus": "ilişkide",
  "workStatus": "çalışıyor",
  "deityResult": "athena",
  "deityName": "Athena",
  "sunSign": "Balık",
  "moonSign": "Akrep",
  "risingSign": "Aslan",
  "element": "Su",
  "energyScore": 78,
  "onboardingComplete": true,
  "membershipType": "free"
}
```

---

### `PUT /profile` 🔐

Profil bilgilerini günceller.

**Request Body:** Güncellenecek alanları içerir (partial update).

| Alan                 | Tip      | Zorunlu | Açıklama                       |
|----------------------|----------|---------|--------------------------------|
| `name`               | `string` | ❌      | Ad Soyad                       |
| `gender`             | `string` | ❌      | `erkek` / `kadın` / `diğer`    |
| `birthDate`          | `string` | ❌      | ISO 8601 tarih                  |
| `birthTime`          | `string` | ❌      | `HH:mm` formatında             |
| `birthCity`          | `string` | ❌      | Doğum şehri                    |
| `birthCountry`       | `string` | ❌      | Doğum ülkesi                   |
| `relationshipStatus` | `string` | ❌      | İlişki durumu                  |
| `workStatus`         | `string` | ❌      | Çalışma durumu                 |

**Response `200`:** Güncellenmiş profil objesi.

---

### `POST /profile/onboarding` 🔐

Onboarding sürecini tamamlar. Backend, gelen doğum bilgilerine göre astrolojik analizleri (güneş burcu, ay burcu, yükselen burç, element, enerji skoru) hesaplar ve kaydeder.

**Request Body:**

| Alan                 | Tip      | Zorunlu | Açıklama                                   |
|----------------------|----------|---------|---------------------------------------------|
| `name`               | `string` | ✅      | Ad Soyad                                    |
| `gender`             | `string` | ✅      | `erkek` / `kadın` / `diğer`                |
| `birthDate`          | `string` | ✅      | ISO 8601 tarih (`1995-03-15`)               |
| `birthTime`          | `string` | ✅      | `HH:mm` formatında (`14:30`)               |
| `birthCity`          | `string` | ✅      | Doğum şehri                                |
| `birthCountry`       | `string` | ✅      | Doğum ülkesi                               |
| `relationshipStatus` | `string` | ✅      | `bekar` / `ilişkide` / `evli` / `karmaşık` |
| `workStatus`         | `string` | ✅      | `öğrenci` / `çalışıyor` / `serbest` / `arıyor` |

**Response `200`:**

```json
{
  "sunSign": "Balık",
  "moonSign": "Akrep",
  "risingSign": "Aslan",
  "element": "Su",
  "deityResult": "athena",
  "deityName": "Athena",
  "energyScore": 78,
  "onboardingComplete": true
}
```

> [!IMPORTANT]
> Backend, `birthDate`, `birthTime`, `birthCity` ve `birthCountry` bilgilerini kullanarak efemeris hesaplama yapar ve güneş, ay, yükselen burçlarını otomatik belirler.

---

## 3. Entitlements (Krediler & XP)

### `GET /entitlements` 🔐

Kullanıcının kredi, XP, seviye, seri ve günlük soru haklarını döner.

**Response `200`:**

```json
{
  "credits": 150,
  "xp": 2400,
  "level": 5,
  "streakDays": 7,
  "dailyQuestionsRemaining": 2,
  "unlockedContentIds": ["crystal_001", "rune_003"],
  "lastResetDate": "2026-02-23T00:00:00.000Z",
  "lastLoginDate": "2026-02-23T19:00:00.000Z"
}
```

---

### `POST /entitlements/spend` 🔐

Kredi harcar. İçerik açma, okuma yapma gibi işlemler için kullanılır.

**Request Body:**

| Alan        | Tip      | Zorunlu | Açıklama                                    |
|-------------|----------|---------|----------------------------------------------|
| `amount`    | `number` | ✅      | Harcanacak kredi miktarı                    |
| `reason`    | `string` | ✅      | Harcama nedeni (`tarot`, `coffee`, `content`, `advisor`) |
| `contentId` | `string` | ❌      | İlgili içerik ID'si (içerik açma için)      |

**Response `200`:**

```json
{
  "credits": 140,
  "unlockedContentIds": ["crystal_001", "rune_003", "crystal_005"]
}
```

**Hata `400`:** Yetersiz kredi.

---

### `POST /entitlements/earn` 🔐

XP kazanır. Quiz tamamlama, aktivite yapma gibi durumlarda kullanılır.

**Request Body:**

| Alan | Tip      | Zorunlu | Açıklama          |
|------|----------|---------|-------------------|
| `xp` | `number` | ✅      | Kazanılacak XP    |

**Response `200`:**

```json
{
  "xp": 2500,
  "level": 5
}
```

---

### `POST /entitlements/ad-watch` 🔐

Reklam izleme ödülü. Başarılı reklam izleme sonrası kredi ekler.

**Request Body:** Yok

**Response `200`:**

```json
{
  "credits": 155
}
```

---

## 4. İçerikler (Content)

İçerikler kristaller, runlar ve ritüeller olmak üzere 3 kategoriye ayrılır.

### `GET /content` 🔐

İçerik listesini döner. Opsiyonel kategori filtresi.

**Query Params:**

| Param      | Tip      | Zorunlu | Açıklama                              |
|------------|----------|---------|----------------------------------------|
| `category` | `string` | ❌      | `crystal` / `rune` / `ritual`         |

**Response `200`:**

```json
[
  {
    "_id": "65a1b2c3...",
    "contentId": "crystal_001",
    "category": "crystal",
    "title": "Ametist",
    "description": "Ruhsal uyanış ve korunma taşı",
    "detail": "Ametist, yüksek titreşimli bir koruma taşıdır...",
    "gradient": ["#7B2FBE", "#3A0D6E"],
    "isFree": false,
    "unlockCost": 10,
    "tip": "Yatmadan önce yastığınızın altına koyun",
    "isUnlocked": true
  }
]
```

---

### `POST /content/:contentId/unlock` 🔐

Kilitli bir içeriği kredi harcayarak açar.

**Path Params:**

| Param       | Tip      | Açıklama  |
|-------------|----------|-----------|
| `contentId` | `string` | İçerik ID |

**Response `200`:** Açılan içerik objesi (detail alanı dahil).

---

### `POST /content/runes/random` 🔐

Rastgele bir rün çeker. Her çekmede kredi harcanabilir.

**Request Body:** Yok

**Response `200`:**

```json
{
  "_id": "65a1b2c3...",
  "contentId": "rune_007",
  "category": "rune",
  "title": "Fehu",
  "description": "Bolluk ve refah rünü",
  "detail": "Fehu rünü zenginliği ve bereketi simgeler...",
  "isFree": false,
  "unlockCost": 5,
  "isUnlocked": true
}
```

---

## 5. Okumalar (Readings)

### `POST /readings/tarot` 🔐

Tarot okuma yapar. Backend, Major Arcana'dan kartları çeker ve AI ile yorum üretir.

**Request Body:**

| Alan       | Tip      | Zorunlu | Açıklama                      |
|------------|----------|---------|-------------------------------|
| `question` | `string` | ❌      | Kullanıcının sorusu (opsiyonel) |

**Response `200`:**

```json
{
  "id": "reading_001",
  "date": "2026-02-23T19:22:00.000Z",
  "question": "Aşk hayatım nasıl olacak?",
  "type": "tarot",
  "cards": [
    {
      "card": {
        "id": 6,
        "nameTR": "Aşıklar",
        "nameEN": "The Lovers",
        "keywordsTR": ["aşk", "seçim", "uyum"],
        "uprightTR": "Derin bağ, uyum, seçim",
        "reversedTR": "Dengesizlik, değer çatışması",
        "archetypeTR": "İlahi birlik",
        "adviceTR": "Kalbinizi dinleyin"
      },
      "isReversed": false,
      "interpretation": "Bu kart aşk hayatınızda güçlü bir bağ oluşacağını..."
    }
  ]
}
```

---

### `POST /readings/coffee` 🔐

Kahve falı okuma. Kullanıcı fincan fotoğrafındaki şekilleri belirtir, AI yorum üretir.

**Request Body:**

| Alan     | Tip      | Zorunlu | Açıklama                                     |
|----------|----------|---------|-----------------------------------------------|
| `shapes` | `string` | ❌      | Fincanda görülen şekillerin açıklaması       |

**Response `200`:**

```json
{
  "id": "coffee_001",
  "date": "2026-02-23T19:22:00.000Z",
  "question": "",
  "result": "Fincanınızda görülen kuş figürü özgürlüğe olan özleminizi...",
  "imageUri": null
}
```

---

### `POST /readings/question` 🔐

Horary astroloji ile soru-cevap. Kullanıcı bir soru sorar, backend astrolojik veriler üzerinden AI ile cevap üretir.

**Request Body:**

| Alan       | Tip      | Zorunlu | Açıklama         |
|------------|----------|---------|-------------------|
| `question` | `string` | ✅      | Kullanıcının sorusu |

**Response `200`:**

```json
{
  "id": "question_001",
  "date": "2026-02-23T19:22:00.000Z",
  "question": "İş değişikliği yapmalı mıyım?",
  "answer": "Şu anki gezegensel transitler gösteriyor ki..."
}
```

---

### `GET /readings/history` 🔐

Kullanıcının tüm geçmiş okumalarını döner (tarot, kahve falı, soru-cevap).

**Response `200`:**

```json
[
  {
    "id": "reading_001",
    "date": "2026-02-23T19:22:00.000Z",
    "question": "Aşk hayatım nasıl olacak?",
    "type": "tarot",
    "cards": [...]
  },
  {
    "id": "coffee_001",
    "date": "2026-02-22T14:00:00.000Z",
    "question": "",
    "type": "coffee",
    "result": "..."
  }
]
```

---

## 6. Danışmanlar (Advisors)

### `GET /advisors` 🔐

Tüm danışman listesini döner.

**Response `200`:**

```json
[
  {
    "id": 1,
    "name": "Ayşe Yıldız",
    "specialties": ["tarot", "astroloji", "rüya yorumu"],
    "rating": 4.8,
    "sessions": 1250,
    "bio": "15 yıllık deneyimli tarot uzmanı...",
    "packages": [
      { "duration": "15 dk", "credits": 30 },
      { "duration": "30 dk", "credits": 50 },
      { "duration": "60 dk", "credits": 90 }
    ],
    "reviews": [
      {
        "user": "Mehmet K.",
        "rating": 5,
        "text": "Çok isabetli yorumlar yaptı"
      }
    ]
  }
]
```

---

### `POST /advisors/request` 🔐

Danışman seansı talep eder. Kredi kontrolü yapılır.

**Request Body:**

| Alan        | Tip      | Zorunlu | Açıklama                 |
|-------------|----------|---------|---------------------------|
| `advisorId` | `string` | ✅      | Danışman ID'si            |
| `question`  | `string` | ✅      | Danışmana sorulacak soru  |

**Response `200`:**

```json
{
  "requestId": "req_001",
  "advisorId": "1",
  "status": "pending",
  "estimatedResponse": "2026-02-23T20:00:00.000Z"
}
```

---

## 7. Astroloji

### `GET /astrology/daily` 🔐

Kullanıcının burcuna göre günlük yorum döner.

**Response `200`:**

```json
{
  "sign": "Balık",
  "date": "2026-02-23",
  "general": "Bugün duygusal enerjiniz yüksek...",
  "love": "Aşk hayatınızda sürprizler olabilir...",
  "career": "İş yerinde yaratıcılığınız ön plana çıkacak...",
  "health": "Meditasyona vakit ayırın...",
  "luckyNumber": 7,
  "luckyColor": "Mor",
  "compatibility": "Akrep"
}
```

---

### `GET /astrology/weekly` 🔐

Haftalık burç yorumu döner.

**Response `200`:**

```json
{
  "sign": "Balık",
  "weekStart": "2026-02-23",
  "weekEnd": "2026-03-01",
  "general": "Bu hafta duygusal derinlikler yaşayacaksınız...",
  "love": "...",
  "career": "...",
  "advice": "..."
}
```

---

### `GET /astrology/natal-chart` 🔐

Kullanıcının doğum haritasını döner. Doğum bilgilerine göre hesaplanır.

**Response `200`:**

```json
{
  "sunSign": "Balık",
  "moonSign": "Akrep",
  "risingSign": "Aslan",
  "element": "Su",
  "planets": [
    { "name": "Güneş", "sign": "Balık", "house": 7, "degree": 24.5 },
    { "name": "Ay", "sign": "Akrep", "house": 3, "degree": 12.8 },
    { "name": "Merkür", "sign": "Kova", "house": 6, "degree": 5.2 }
  ],
  "houses": [
    { "house": 1, "sign": "Aslan", "degree": 0 },
    { "house": 2, "sign": "Başak", "degree": 30 }
  ],
  "aspects": [
    { "planet1": "Güneş", "planet2": "Ay", "type": "üçgen", "degree": 120 }
  ]
}
```

---

### `POST /astrology/compatibility` 🔐

İki burç arasında uyum analizi yapar.

**Request Body:**

| Alan      | Tip      | Zorunlu | Açıklama                       |
|-----------|----------|---------|--------------------------------|
| `signId1` | `number` | ✅      | İlk burcun ID'si (1-12)       |
| `signId2` | `number` | ✅      | İkinci burcun ID'si (1-12)    |

**Response `200`:**

```json
{
  "sign1": "Balık",
  "sign2": "Akrep",
  "overallScore": 92,
  "love": 95,
  "friendship": 88,
  "communication": 85,
  "description": "Bu iki su burcu arasında derin bir ruhsal bağ...",
  "strengths": ["Duygusal derinlik", "Sezgisel anlayış"],
  "challenges": ["Aşırı duygusallık", "Kıskançlık"]
}
```

---

### `GET /transits` 🔐

Güncel gezegensel transitler döner.

**Response `200`:**

```json
{
  "date": "2026-02-23",
  "transits": [
    {
      "planet": "Venüs",
      "sign": "Koç",
      "degree": 15.3,
      "retrograde": false,
      "effect": "Aşk ve ilişkilerde cesaret"
    },
    {
      "planet": "Mars",
      "sign": "İkizler",
      "degree": 8.7,
      "retrograde": false,
      "effect": "Zihinsel enerji yüksek"
    }
  ],
  "moonPhase": "Dolunay",
  "generalAdvice": "Bugün duygusal kararlar almaktan kaçının..."
}
```

---

## 8. Günlük Tarot

### `GET /daily-tarot` 🔐

Kullanıcıya özel günlük tarot kartı döner. Her gün aynı kullanıcıya aynı kartı verir.

**Response `200`:**

```json
{
  "date": "2026-02-23",
  "card": {
    "id": 17,
    "nameTR": "Yıldız",
    "nameEN": "The Star",
    "keywordsTR": ["umut", "ilham", "yenilenme"],
    "uprightTR": "Umut, ilham, huzur",
    "reversedTR": "Umutsuzluk, bağlantı kopukluğu",
    "archetypeTR": "İlahi ışık",
    "adviceTR": "İçsel huzurunuzu bulun"
  },
  "isReversed": false,
  "dailyMessage": "Bugün Yıldız kartı sizinle..."
}
```

---

## 9. Abonelikler (Subscriptions)

### `GET /subscriptions/plans`

Mevcut abonelik planlarını döner.

**Response `200`:**

```json
[
  {
    "id": "plan_free",
    "name": "Ücretsiz",
    "price": 0,
    "currency": "TRY",
    "period": "aylık",
    "features": ["Günlük 3 soru", "Günlük tarot", "Temel burç yorumu"],
    "credits": 0
  },
  {
    "id": "plan_premium",
    "name": "Premium",
    "price": 79.99,
    "currency": "TRY",
    "period": "aylık",
    "features": ["Sınırsız soru", "Tüm okuma türleri", "Danışman erişimi", "Reklamsız"],
    "credits": 100
  },
  {
    "id": "plan_annual",
    "name": "Yıllık Premium",
    "price": 599.99,
    "currency": "TRY",
    "period": "yıllık",
    "features": ["Premium tüm özellikler", "Özel danışman önceliği"],
    "credits": 500
  }
]
```

---

### `POST /subscriptions/purchase` 🔐

Abonelik satın alır. App Store / Google Play receipt doğrulaması yapılır.

**Request Body:**

| Alan       | Tip      | Zorunlu | Açıklama                         |
|------------|----------|---------|-----------------------------------|
| `planId`   | `string` | ✅      | Plan ID                          |
| `receipt`  | `string` | ❌      | Store receipt (doğrulama için)    |
| `platform` | `string` | ❌      | `ios` / `android`                |

**Response `200`:**

```json
{
  "subscription": {
    "planId": "plan_premium",
    "status": "active",
    "startDate": "2026-02-23T19:22:00.000Z",
    "endDate": "2026-03-23T19:22:00.000Z"
  },
  "credits": 250
}
```

---

### `GET /subscriptions/status` 🔐

Mevcut abonelik durumunu döner.

**Response `200`:**

```json
{
  "planId": "plan_premium",
  "status": "active",
  "startDate": "2026-02-23T19:22:00.000Z",
  "endDate": "2026-03-23T19:22:00.000Z",
  "autoRenew": true
}
```

---

## 10. Push Bildirimleri

### `PUT /profile/push-token` 🔐

Cihazın push bildirim tokenını kaydeder.

**Request Body:**

| Alan    | Tip      | Zorunlu | Açıklama              |
|---------|----------|---------|------------------------|
| `token` | `string` | ✅      | Expo push token        |

**Response `200`:**

```json
{
  "success": true
}
```

---

## 11. Veri Modelleri

### UserProfile

```typescript
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  gender: string;               // "erkek" | "kadın" | "diğer"
  birthDate: string;            // ISO 8601
  birthTime: string;            // "HH:mm"
  birthCity: string;
  birthCountry: string;
  relationshipStatus: string;   // "bekar" | "ilişkide" | "evli" | "karmaşık"
  workStatus: string;           // "öğrenci" | "çalışıyor" | "serbest" | "arıyor"
  deityResult: string;          // Mitolojik tanrı/tanrıça ID'si
  deityName: string;
  sunSign: string;              // Backend hesaplar
  moonSign: string;             // Backend hesaplar
  risingSign: string;           // Backend hesaplar
  element: string;              // "Ateş" | "Toprak" | "Hava" | "Su"
  energyScore: number;          // 0-100
  onboardingComplete: boolean;
  membershipType: string;       // "free" | "premium"
}
```

### Entitlements

```typescript
interface Entitlements {
  credits: number;
  dailyQuestionsRemaining: number;  // Her gün 3'e resetlenir
  streakDays: number;               // Üst üste giriş günü
  xp: number;
  level: number;
  lastResetDate: string;
  lastLoginDate: string;
  unlockedContentIds: string[];
}
```

### TarotCard

```typescript
interface TarotCard {
  id: number;                    // 0-21 (Major Arcana)
  nameTR: string;
  nameEN: string;
  keywordsTR: string[];
  uprightTR: string;
  reversedTR: string;
  archetypeTR: string;
  adviceTR: string;
}
```

### Advisor

```typescript
interface Advisor {
  id: number;
  name: string;
  specialties: string[];        // ["tarot", "astroloji", "rüya yorumu", ...]
  rating: number;               // 1-5
  sessions: number;
  bio: string;
  packages: { duration: string; credits: number }[];
  reviews: { user: string; rating: number; text: string }[];
}
```

### ContentItem

```typescript
interface ContentItem {
  _id: string;
  contentId: string;
  category: string;             // "crystal" | "rune" | "ritual"
  title: string;
  description: string;
  detail?: string;              // Sadece kilit açıldığında görünür
  gradient?: string[];          // UI gradient renkleri
  isFree: boolean;
  unlockCost: number;
  tip?: string;
  isUnlocked: boolean;
}
```

### ZodiacSign

```typescript
interface ZodiacSign {
  id: number;                   // 1-12
  nameTR: string;
  nameEN: string;
  symbol: string;
  dateRange: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  element: string;              // "Ateş" | "Toprak" | "Hava" | "Su"
  rulingPlanet: string;
  descriptionTR: string;
  compatibleSigns: number[];    // Uyumlu burç ID'leri
}
```

---

## 12. Hata Kodları

| HTTP Kodu | Anlam                  | Açıklama                                                      |
|-----------|------------------------|----------------------------------------------------------------|
| `200`     | Başarılı               | İstek başarıyla tamamlandı                                     |
| `400`     | Geçersiz İstek         | Eksik veya hatalı parametreler                                |
| `401`     | Yetkisiz               | Token geçersiz veya süresi dolmuş                              |
| `403`     | Yasaklı                | Bu işlem için yetkiniz yok                                     |
| `404`     | Bulunamadı             | İstenen kaynak mevcut değil                                    |
| `409`     | Çakışma                | Email zaten kayıtlı                                           |
| `422`     | İşlenemez              | Yetersiz kredi veya günlük limit dolmuş                       |
| `429`     | Çok Fazla İstek        | Rate limit aşıldı                                              |
| `500`     | Sunucu Hatası          | Beklenmeyen hata                                               |

**Hata Response Formatı:**

```json
{
  "error": "Yetersiz kredi",
  "code": "INSUFFICIENT_CREDITS",
  "details": {
    "required": 10,
    "available": 5
  }
}
```

---

## Kredi Maliyetleri (Referans)

| İşlem                 | Maliyet (Kredi) |
|-----------------------|:----------------:|
| Tarot Okuma           | 10               |
| Kahve Falı            | 10               |
| Horary Soru           | 5                |
| Kristal İçerik Aç     | 10               |
| Rün İçerik Aç         | 5                |
| Ritüel İçerik Aç      | 8                |
| Rastgele Rün Çek       | 5                |
| Danışman Seansı (15dk) | 30               |
| Danışman Seansı (30dk) | 50               |
| Danışman Seansı (60dk) | 90               |
| Reklam İzleme Ödülü   | +5               |

## Kredi Paketleri

| Paket     | Kredi | Fiyat      |
|-----------|:-----:|------------|
| Başlangıç | 50    | 29.99 TL   |
| Standart  | 120   | 59.99 TL   |
| Premium   | 300   | 119.99 TL  |
| Mega      | 700   | 199.99 TL  |
