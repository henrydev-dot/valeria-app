# Valeria — Master Redesign & Apple Launch Plan

> Kapsam: Mobil uygulamanın (Expo/React Native) baştan aşağı yeniden tasarımı,
> onboarding'in mükemmelleştirilmesi, backend AI bağlantısının düzeltilmesi ve
> App Store değerlendirmesine hazırlık. Bu belge PM + UX + Mühendislik + Apple
> Tester rollerinin ortak yol haritasıdır.

Tarih: 2026-07 · Durum: Uygulama aşamasında

---

## 0. Yönetici Özeti

Uygulama sağlam bir renk paletine ve gerçek bir backend'e (JWT auth, MongoDB,
Gemini AI) sahip. Ancak:

- **Tasarım sistemi yok**: renkler tutarlı ama tipografi/spacing/komponent
  disiplini yok; her ekran kendi butonunu/kartını yeniden üretmiş.
- **Onboarding kırılgan**: SafeArea yok, tarih seçici hatalı (31 Şubat kabul
  ediyor), "enerji skoru" rastgele, ay/yükselen burç placeholder, geri/ilerleme
  tutarsız, hata durumunda tüm onboarding sessizce kayboluyor.
- **4 kötü ekran**: Ana sayfa (690 satır yapısız yığın), Astroloji (boş/hata
  state yok, çok küçük), Fal (sahte danışman + sahte sohbet), Profil (sahte
  toggle/rozet).
- **Fonksiyonel buglar**: `spendCredits` async-truthy hatası → tüm ücretli
  içerik bedava açılıyor; GradientBackground her render'da yıldızları yeniden
  rastgeleliyor (titreme).
- **AI "bağlı değil" algısı**: Kod bağlı ama model ID `gemini-3-flash-preview`
  geçersiz → her çağrı sessizce şablon fallback'e düşüyor. Doğru ID:
  `gemini-flash-latest` (veya `gemini-3.5-flash`).
- **Apple blokerleri**: hesap silme yok (otomatik ret), zorunlu kayıt, uyumsuz
  Apple butonu, onboarding'de gizlilik/şartlar yok, IAP receipt doğrulaması yok,
  4.3 "doygun kategori" riski.

Bu plan bunları sıralı fazlarla çözer.

---

## 1. Ürün Stratejisi (PM)

### 1.1 Konumlandırma & 4.3 farklılaşması
App Store fal/astroloji kategorisini "spam/doygun" (Guideline 4.3) sayıyor ve
"eğlence amaçlıdır" notu tek başına kurtarmıyor. Valeria'yı kopyalardan ayıran
**özgün değer** öne çıkarılmalı:

- **Yunan Tanrı Arketipi kişilik sistemi** (12 soruluk test → 12 tanrı arketipi,
  özgün içerik ve görseller). Bu, standart burç uygulamalarında yok.
- **Kişiselleştirilmiş AI okumaları** (kullanıcının doğum haritası + ilişki/iş
  durumuna göre üretilen tarot/kahve/soru yorumları) — gerçek natal hesaplama
  (astronomy-engine) ile beslenen.
- **Çok modlu kahve falı** (fincan fotoğrafı → AI görüntü analizi).

Metin ve App Store açıklamasında bu üç özgün özellik vurgulanacak.

### 1.2 Kullanıcı yolculuğu (funnel)
Hedef: ilk açılışta değer göster → yumuşak kayıt → kişiselleştirme → aha anı.

`Welcome (değer önerisi + guest bak) → Auth (Apple/email) → İsim → Cinsiyet →
Doğum tarihi → Doğum saati (bilmiyorum seçeneği) → Doğum yeri → Yaşam bağlamı →
Hesaplama → Kozmik özet (gerçek veri) → Ana sayfa`.

---

## 2. Tasarım Sistemi (UX)

Tek kaynak: `src/theme`. Zorunlu kullanım.

- **Renk**: mevcut indigo/mor + altın paleti korunur, genişletilir (yüzeyler,
  state renkleri, gradient setleri, opaklık token'ları).
- **Tipografi**: gerçek tip rampası + `Text` sarmalayıcı bileşen (`AppText`)
  variant'larıyla (`hero/title/h1/h2/body/caption/label`), ağırlık token'ları.
- **Spacing/Radius/Shadow/Motion**: token'lar; tüm ekranlar bunları kullanır.
- **Çekirdek bileşenler** (yeniden/yeni):
  - `Screen` (SafeArea + gradient + scroll yönetimi + klavye) — her ekran bunu kullanır.
  - `GradientBackground` (yıldızlar `useMemo` ile bir kez, `pointerEvents="none"`).
  - `AppText`, `Button` (primary/secondary/ghost + loading + a11y), `Card`,
    `ProgressBar`, `Chip`, `SegmentedControl`, `Stepper`, `Field` (label+input+error),
    `IconTile`, `EmptyState`, `Skeleton`, `Sheet`.
- **Erişilebilirlik**: her dokunulabilir öğede `accessibilityRole/Label`, min 44pt
  hedef, renk+ikon ile durum (sadece renk değil).
- **Türkçe**: tüm metinler doğru diakritikle (Güneş, Keşfet, Danışmanlar…),
  merkezi string modülü.

---

## 3. Onboarding Yeniden Tasarımı (kritik)

Sorun→çözüm:

| Sorun | Çözüm |
|---|---|
| SafeArea yok, hardcoded padding | `Screen` bileşeni + insets |
| İlerleme göstergesi yok | Üstte `ProgressBar` (adım/toplam) |
| Geri/footer tutarsız | Tek `OnboardingScaffold` (geri + ilerleme + footer CTA) |
| Tarih stepper'ı kötü + 31 Şubat bug | Wheel/segment tarih seçici, ay'a göre gün sınırı, geçerli aralık |
| Doğum saati "bilmiyorum" yok | "Saati bilmiyorum" seçeneği → yükselen hesaplaması atlanır/işaretlenir |
| Rastgele enerji skoru | Kaldırıldı; skor gerçek profil verisinden türetilir veya gösterilmez |
| Ay/yükselen placeholder | Backend gerçek hesaplaması tek kaynak; client tekrar hesaplamaz |
| step8 sessiz hata | Hata durumunda retry + ilerlemeyi engelle (kullanıcı kaybolmaz) |
| Apple butonu uyumsuz | Resmi `AppleAuthenticationButton`, sadece iOS + `isAvailableAsync` |
| Gizlilik/şartlar yok | Auth ekranında Gizlilik/Şartlar linkleri + rıza metni |
| Zorunlu kayıt | Welcome'da "önce keşfet" (guest) yolu / değer gösterimi |
| "Adalet" sahte şehir, dropdown layout | Şehir listesi temizlenir, öneriler overlay |

---

## 4. Ekran Yeniden Tasarımları

1. **Ana Sayfa**: Bölümlere ayrılmış, öncelikli kartlar (günün özeti, günlük
   tarot, tanrı arketipi, ay döngüsü), "hepsini gör" ile derinlik; jargon
   kademeli açılır; `tintColor` kaldırılır (ikon sanatı korunur); Toprak→hava
   ikon bug'ı düzeltilir; paywall tek ve nazik.
2. **Astroloji**: Yükleniyor/boş/hata state'leri (skeleton); natal çark okunur
   boyut + lejant + dokunulabilir gezegen/ev; metin kartları gerçek AI'dan.
3. **Fal**: Tek danışman sistemi (Valeria AI + gerçek danışman kataloğu); sahte
   sohbet kaldırılır veya gerçek backend'e bağlanır; net fiyat/ücret; boş state.
4. **Profil**: Toggle'lar gerçek (bildirim izni + kalıcılık); rozetler gerçek
   koşullara bağlı; "Günlük Limit: 0" yerine anlamlı mesaj; avatar hata state'i;
   **Hesabı Sil**; Gizlilik/Şartlar; ham hex → token.
5. **Keşfet**: `spendCredits` await + gerçek bakiye kontrolü; unlock kalıcılığı
   backend'e; içerik paleti uyumlu.
6. **Feature ekranları** (tarot/kahve/sarkaç/soru/danışman/kredi): SafeArea +
   klavye yönetimi, markdown render, maliyet önizleme, yükleme/hata state.
7. **Global**: console.log temizliği, GradientBackground memo, a11y.

---

## 5. Apple Değerlendirme Hazırlığı (Tester)

Zorunlu (bloker):
- [ ] **Hesap silme** — uygulama içi akış + backend `DELETE /profile` (Apple SIWA
      token revoke dahil). (5.1.1(v))
- [ ] **IAP** — dijital kredi/abonelik yalnızca Apple IAP; receipt doğrulaması
      (StoreKit/App Store Server API). (3.1.1) — MVP: gerçek IAP entegrasyonu +
      sunucu doğrulaması; demo "bedava kredi" akışları kaldırılır/gizlenir.
- [ ] **Sign in with Apple** resmi buton + backend identity token doğrulaması.
- [ ] **Gizlilik Politikası + Kullanım Şartları** linkleri (onboarding + profil)
      ve App Store metadata Privacy Policy URL.
- [ ] **App Privacy "Nutrition Label"** — toplanan veri beyanı (doğum verisi,
      cinsiyet, ilişki durumu hassas → doğru beyan + rıza).
- [ ] **Yaş derecelendirmesi** (17+ ya da uygun) — fal/okült içerik.
- [ ] **Reviewer notes + demo hesap** (giriş bilgileri) hazırlanır.
- [ ] **4.3 farklılaşması** metinlerde vurgulanır (Bölüm 1.1).
- [ ] **ATT** — reklam/izleme varsa `NSUserTrackingUsageDescription` + prompt;
      yoksa "izleme yok" beyanı.
- [ ] Cold push izni yerine **priming** ekranı.
- [ ] Tüm placeholder/rastgele "kişiselleştirilmiş" içerik gerçek veriye bağlanır
      (2.3.1 yanıltıcı içerik riski).

Teslimler: `APPLE_REVIEW.md` (checklist + reviewer notes + demo hesap + metadata).

---

## 6. Backend & AI

- [ ] Model ID `gemini-3-flash-preview` → `gemini-flash-latest` (config'e taşınır,
      env ile override edilebilir).
- [ ] AI hatalarını **logla** (sessiz fallback yerine gözlemlenebilir);
      fallback korunur ama neden görünür olur.
- [ ] `.env.example` + kurulum README (GEMINI_API_KEY, MONGODB_URI, JWT secret'lar,
      EXPO_PUBLIC_API_URL).
- [ ] Güvenlik: admin route'larına auth; JWT fallback secret'ları prod'da reddet;
      Apple identity token doğrulaması; IAP receipt doğrulaması.
- [ ] Hesap silme endpoint'i.

---

## 7. Uygulama Fazları (sıra)

- **Faz 1** — Tasarım sistemi (tema + çekirdek bileşenler).
- **Faz 2** — Onboarding baştan (welcome, auth, adımlar, özet).
- **Faz 3** — Ana sayfa / Astroloji / Fal / Profil yeniden tasarım.
- **Faz 4** — Feature ekranları + global temizlik + a11y.
- **Faz 5** — Apple hazırlığı (hesap silme, gizlilik, IAP, reviewer notes).
- **Faz 6** — Backend AI + güvenlik düzeltmeleri.

Her faz ayrı commit + push ile teslim edilir.
