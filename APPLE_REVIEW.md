# Valeria — App Store Review Hazırlık Dosyası

Bu belge App Store Connect gönderiminden önce tamamlanması gerekenleri, reviewer
notlarını ve mevcut uyum durumunu içerir.

## Uygulama kimliği (eas.json)
- Bundle ID: `com.astrovaleria.app`
- Apple Team ID: `FK934B3JMZ`
- ASC App ID: `6760306880`
- Apple ID (submit): `sumeyyedogan001@icloud.com`

---

## 1. Guideline 4.3 (Doygun kategori / Spam) — EN YÜKSEK RİSK

Fal/astroloji kategorisi Apple tarafından doygun kabul edilir ve "eğlence
amaçlıdır" ibaresi tek başına yeterli değildir. Valeria'yı kopyalardan ayıran
özgün işlevleri **App Store açıklamasında ve reviewer notunda** vurgulayın:

- **Yunan Tanrı Arketipi kişilik sistemi** — 12 soruluk özgün test, 12 tanrı
  arketipi, özgün görsel seti ve içerik.
- **Gerçek doğum haritası hesaplaması** — `astronomy-engine` ile gerçek gezegen
  konumları (şablon değil).
- **Kişiselleştirilmiş içerik** — kullanıcının haritası + yaşam bağlamına göre
  üretilen okumalar.
- **Çok modlu kahve falı** — fincan fotoğrafından görüntü analizi.

Reviewer notuna örnek cümle: *"Valeria is not a generic horoscope app; it centers
on an original Greek-deity archetype personality system, real natal-chart
computation, and multimodal coffee-cup image reading — features not present in
standard zodiac apps."*

---

## 2. Guideline 5.1.1(v) — Hesap Silme (ZORUNLU) — ✅ Uygulandı

- Uygulama içi akış: **Profil → Hesap & Gizlilik → Hesabı Sil** (`app/delete-account.tsx`).
- Onay: kullanıcı `SİL` yazıp iki aşamalı onay verir.
- Backend: `DELETE /api/profile` kullanıcıyı ve tüm ilişkili verilerini
  (Reading, FalReading, DailyTarot, ReadingRequest) kalıcı siler.
- Sign in with Apple kullanıldıysa Apple token'ı iptal edilir
  (`utils/appleAuth.ts`).

**Gönderim öncesi tamamlanacak (SIWA revoke tam çalışması için):**
Apple, SIWA kullanan uygulamalarda hesap silmede token iptalini zorunlu tutar.
Revoke fonksiyonu hazır ama şu env değişkenleri + Apple'ın verdiği refresh
token'ın saklanması gerekir:
- `APPLE_TEAM_ID`, `APPLE_CLIENT_ID` (bundle id), `APPLE_KEY_ID`,
  `APPLE_PRIVATE_KEY` (.p8 içeriği).
- Sign-in sırasında Apple authorization code → refresh token elde edilip
  `User.appleRefreshToken` alanına yazılmalı (şu an client yalnızca `appleId`
  gönderiyor). Bu env'ler yoksa silme yine çalışır, revoke atlanır.

---

## 3. Guideline 3.1.1 — In-App Purchase (KRİTİK — GÖNDERİM ÖNCESİ ŞART)

Dijital kredi ve premium abonelik **yalnızca Apple IAP ile** satılmalı.

**Mevcut durum:** `buy-credits` ve `subscriptions/purchase` şu an **simülasyon**
(gerçek ödeme yok, receipt doğrulaması yok). Bu haliyle:
- Ya gerçek **StoreKit / RevenueCat IAP** entegre edilmeli + sunucu tarafı
  receipt/App Store Server API doğrulaması eklenmeli,
- Ya da para karşılığı dijital içerik satan tüm akışlar **ilk sürümde
  gizlenmeli** (uygulama tamamen ücretsiz/krediler yalnızca kazanılarak).

`entitlements/add-credits`, `ad-watch` ve `subscriptions/purchase` doğrulamasız
kredi veriyor; gönderimde ya IAP'a bağlanmalı ya kaldırılmalı.

> Öneri: İlk gönderimi IAP olmadan (tamamen ücretsiz, satın alma yok) yapıp
> onaydan sonra IAP'ı ayrı bir sürümde eklemek en hızlı yoldur.

---

## 4. Sign in with Apple — ✅ (rendering düzeltildi)
- Resmi `AppleAuthentication.AppleAuthenticationButton` kullanılıyor, yalnızca
  iOS'ta ve `isAvailableAsync()` true ise gösteriliyor (`app/(auth)/login.tsx`).
- Backend `POST /auth/apple` mevcut. **Öneri:** identity token'ı Apple'ın public
  key'leriyle doğrula (şu an client `appleId`'ye güveniyor).

## 5. Gizlilik — ✅ kısmen
- Gizlilik Politikası ve Kullanım Şartları linkleri welcome, login ve profilde.
- **App Privacy "Nutrition Label"** ASC'de doldurulmalı. Toplanan hassas veriler:
  ad, e-posta, cinsiyet/kimlik, ilişki durumu, doğum tarihi/saati/yeri,
  push token. Bunlar "kişiselleştirme" amaçlı; satılmıyor.
- `valeria.app/privacy` ve `valeria.app/terms` sayfaları **yayında olmalı**
  (URL'ler `src/config.ts`).

## 6. İzinler — ✅
- Kamera/galeri kullanım açıklamaları `app.json`'da (kahve falı için).
- Push izni artık **cold** istenmiyor; profildeki "Bildirimler" toggle'ı ile
  kullanıcı tetikliyor (priming).
- **ATT gerekmiyor** (üçüncü taraf izleme/reklam yok). Reklam eklenirse
  `NSUserTrackingUsageDescription` + ATT prompt gerekir.

## 7. Yaş derecelendirmesi
- Fal/okült içerik nedeniyle ASC'de uygun derecelendirme (genellikle 17+ /
  "Sık/Yoğun Kaçınılması Gereken Olgun/Öneri Temalar") seçilmeli.

## 8. İçerik doğruluğu (2.3.1)
- "Kişiselleştirilmiş" gösterilen içerik gerçek veriden türetiliyor; onboarding'de
  rastgele enerji skoru ve placeholder ay/yükselen hesabı kaldırıldı.

---

## Reviewer Demo Hesabı (gönderimde doldurulacak)
```
E-posta: review@valeria.app        (önceden oluşturulmuş, onboarding tamamlanmış)
Şifre:   ******
Not: Krediler test için yüklüdür; Tarot/Kahve/Soru akışları hazır cevap döndürür
     (AI_BYPASS aktif), bu yüzden dış servis gerektirmez.
```

## Gönderim Öncesi Checklist
- [ ] 4.3 farklılaşma metni App Store açıklaması + reviewer notuna eklendi
- [ ] IAP kararı verildi (gerçek StoreKit IAP **veya** satın alma akışları gizlendi)
- [ ] Gizlilik Politikası + Şartlar URL'leri yayında
- [ ] App Privacy nutrition label dolduruldu
- [ ] Yaş derecelendirmesi seçildi
- [ ] SIWA revoke env'leri ayarlandı (veya SIWA kaldırıldı)
- [ ] Demo hesap oluşturuldu ve reviewer notuna yazıldı
- [ ] Ekran görüntüleri (6.7"/6.5"/5.5" ve iPad) hazırlandı
- [ ] `AI_BYPASS`/`GEMINI_API_KEY`/`MONGODB_URI`/JWT secret'lar prod ortamında set
