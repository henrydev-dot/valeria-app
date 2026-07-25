/**
 * FAL BİLGİSİ MODÜLÜ
 *
 * Her fal türünün GERÇEK metodolojisi burada durur ve ilgili prompt'a gömülür.
 * Amaç: AI'ın "genel geçer olumlu laflar" yerine, o falın doğasına uygun
 * (kahvede sembol+bölge, tarotta pozisyon+ters doktrin, horary'de ev+niteleyici)
 * otantik bir okuma yapması.
 *
 * Kaynak: geleneksel Türk kahve falı sözlükleri, 3 kart tarot açılım usulü,
 * klasik horary (Lilly ekolü) kuralları — sadeleştirilmiş halleriyle.
 */

/* ─────────────────────────────────────────────────────────────────
 * ÖRTÜK KİŞİSELLEŞTİRME DOKTRİNİ (tüm fallarda ortak)
 *
 * Kullanıcının girdiği veriler (ilişki durumu, iş, yaş, geçmiş sorular)
 * yorumun YÖNÜNÜ belirler ama ASLA açıkça geri söylenmez. Gerçek falcı
 * "sen bekarsın" demez; bakar ve "hayatına yeni birinin girmesine alan
 * açtığın bir dönemdesin" der. Kullanıcı verisinin kendisine geri
 * okunduğunu fark ederse büyü bozulur.
 * ───────────────────────────────────────────────────────────────── */
export const IMA_KURALLARI = `
ÖRTÜK KİŞİSELLEŞTİRME KURALLARI (ÇOK ÖNEMLİ — falın inandırıcılığı buna bağlı):
1. Kişinin profil bilgilerini (ilişki durumu, iş durumu, yaş, cinsiyet) ve geçmiş
   sorularını/fallarını ASLA açıkça zikretme, alıntılama veya ima yoluyla "biliyorum"
   deme. Bu bilgiler yalnızca yorumunun YÖNÜNÜ ve örneklerini belirlesin.
2. YASAK kalıplar: "bekar olduğun için", "bekar olduğunu seçmişsin", "ilişkide
   olduğunu söylemiştin", "geçen sefer ... diye sormuştun", "profilinde ... yazıyor",
   "öğrenci olduğun için", "daha önce baktırdığın falda", "bana vermiş olduğun bilgilere göre".
3. DOĞRU YAKLAŞIM — bilgiyi sezgiye dönüştür:
   - Kişi bekar → YANLIŞ: "Bekar olduğun için yeni birini arıyorsun."
     DOĞRU: "Kalbinin kapısını yeni birine aralamaya hazırlandığın bir dönemdesin."
   - Kişi "ayrılacak mıyım?" diye sormuş → YANLIŞ: "Ayrılmayı düşündüğünü biliyorum."
     DOĞRU: "İlişkinin üzerinde bir süredir gölgeler dolaşıyor; emek ve bakış açısı
     değişimi dengeyi geri getirebilir."
   - Kişi iş arıyor → YANLIŞ: "İş aradığın için..."
     DOĞRU: "Emeklerinin karşılığını göreceğin bir kapı aralanıyor."
4. Geçmiş fallara atıf SADECE tema düzeyinde ve fal diliyle yapılır:
   "bir süredir kalbini meşgul eden o konu", "ruhunun taşıdığı o eski soru" gibi.
   Kart adı anılabilir ama "sormuştun/çıkmıştı" kalıbı olmadan: "Kule'nin sarstığı
   düzenin yerine yenisi kuruluyor" DOĞRU; "geçen falında Kule çıkmıştı" YANLIŞ.
5. Fal daima kişiye bir şey KEŞFEDİYORMUŞ gibi akmalı — asla kişinin verdiği
   bilgiyi ona geri okuyormuş gibi değil.`;

/* ─────────────────────────────────────────────────────────────────
 * KAHVE FALI
 * ───────────────────────────────────────────────────────────────── */
export const KAHVE_BOLGE_REHBERI = `
FİNCAN BÖLGELERİ VE ZAMAN OKUMASI (geleneksel usul):
- Kulp tarafı: kişinin kendisi, evi, iç dünyası. Kulpun karşısı: çevresi, dış olaylar, başkaları.
- Ağız kenarı (üst şerit): çok yakın gelecek (1-3 hafta) ve halihazırda kapıda olan şeyler.
- Orta kuşak: 1-2 ay içindeki gelişmeler.
- Dip: geçmiş, kök duygular, kalpte taşınan yükler. Dipteki koyuluk = atılması gereken eski bir sıkıntı.
- Tabak: ev, yerleşik düzen, uzak gelecek; tabakta akan yol = eve/kalıcı düzene dair değişim.
- Telvenin genel dengesi: aydınlık/açık fincan = ferahlık, rahatlama; yoğun/karanlık bölgeler = o alanda sıkışıklık.
- İyi bir yorum sembolü TEK başına değil, bölgesiyle birlikte okur: ağız kenarındaki kuş "çok yakında haber",
  dipteki kuş "geçmişten gelen bir haberin etkisi" demektir.`;

export const KAHVE_SEMBOL_SOZLUGU = `
KAHVE FALI SEMBOL SÖZLÜĞÜ (yaygın semboller ve geleneksel anlamları):
- Kuş: haber, müjde; uçan kuş hızla gelen havadis. Güvercin: barış, gönül bağı. Baykuş: uyarı, dikkat.
- Yol/yollar: değişim, yolculuk, yeni güzergah; çatallanan yol = seçim arefesi; açık geniş yol = ferah gidişat.
- Kalp: aşk, gönül bağı; çevresi açıksa karşılıklı duygu, gölgeliyse bekleyen duygusal konuşma.
- Yılan: gizli kıskançlık, sinsi engel; başı yukarıysa uyanık olunmalı, ezilmişse atlatılmış tehlike.
- Balık: kısmet, bereket, para; birden çok balık = art arda gelen kısmetler.
- Ağaç: huzur, köklenme, aile; dallı budaklı ağaç geniş bir destek çevresi.
- Dağ/tepe: hedefe giden yolda engel; ardı aydınlıksa aşılacak, zirvede bayrak = başarı.
- Kapı/anahtar: yeni fırsat, açılacak kapı; anahtar = çözüm kişinin elinde.
- Göz: nazar, üzerinde dolaşan dikkat; kalabalıktan gelen enerjiye karşı koruma ihtiyacı.
- Ay: duygusal derinleşme, sezgi; hilal = yeni duygusal başlangıç.
- Güneş/yıldız: aydınlanma, şans, murada erme.
- İnsan silüeti: hayata girecek/etkili biri; kulpa yakınsa yakın çevreden, karşıdaysa dışarıdan.
- Köpek: sadık dost. Kedi: nazlı ama mesafeli bir yakınlık, bazen küçük bir ihanet uyarısı.
- At: murat, kuvvet, gelen destek. Fil: güçlü ve kalıcı kısmet. Kuğu: zarif bir aşk.
- Çiçek/gül: mutluluk, iltifat, güzel havadis. Yaprak: kısa ömürlü sevinçler.
- Yüzük: söz, bağlanma, anlaşma; kırık yüzük = gözden geçirilecek bir söz.
- Mektup/zarf: resmi haber, evrak, mesaj. Çanta/bavul: yolculuk ya da taşınma.
- Merdiven: adım adım yükseliş. Köprü: iki durum/iki kalp arasında geçiş.
- Yıldızlı gökyüzü/nokta serpintisi: dağınık ama umut veren küçük gelişmeler.
- Harfler: hayatta önemli bir ismin baş harfi (asla kesin kişi atama, sadece işaret et).
- Sayılar: zaman işareti (3 = üç gün/hafta gibi); daima "yaklaşık" dilinde kullan.
- Kuyruklu yıldız: beklenmedik ani havadis. Şemsiye: korunma, sığınacak liman.
- Terazi: karar, adalet, denge arayışı. Makas: ayrışma, kesip atma ihtiyacı.
NOT: Sembolleri fincanda "görüyormuş" gibi tasvir et ("şurada, ağız kenarında bir kuş belirmiş...").
Vision'dan gelen sembol listesindeki her sembolü bu sözlükle ve bölgesiyle harmanla; listede olmayan sembol uydurma.`;

/* ─────────────────────────────────────────────────────────────────
 * TAROT
 * ───────────────────────────────────────────────────────────────── */
export const TAROT_OKUMA_REHBERI = `
3 KART AÇILIMI OKUMA USULÜ:
1. Önce BÜTÜNE bak: Üç kartın ortak hikayesi ne? Kaç majör arkana var (majör çoksa
   konu kader düzeyinde önemli)? Kaç ters kart var (ters çoksa süreç içsel/tıkanık)?
   Tekrarlayan tema var mı (hepsi değişim mi, hepsi duygu mu)?
2. Pozisyon anlamları:
   - GEÇMİŞ: bugünü şekillendiren yaşanmışlık, kapanmakta olan etki. Geçmiş kartı
     suçlamak için değil, "bugün neden böyle hissediyorsun"u açıklamak için okunur.
   - ŞİMDİ: mevcut enerji, kişinin tam ortasında durduğu ders. En çok bu karta ağırlık ver.
   - GELECEK: kader değil YÖN. "Bu yolda devam edersen seni bekleyen enerji" dilinde,
     kişinin seçimleriyle değişebileceğini hissettirerek yorumla.
3. TERS KART DOKTRİNİ: Ters kart felaket değildir. Anlamı üç ihtimalden uygun olanıyla oku:
   (a) kartın enerjisi TIKANMIŞ/gecikmiş, (b) enerji İÇE dönmüş (dışarıda değil kişinin
   iç dünyasında yaşanıyor), (c) kartın gölge yüzü aktif. "Nerede tıkanıklık var?" sorusuyla yaklaş.
4. KARTLARI BİRBİRİNE BAĞLA: Geçmiş kartındaki tema şimdi kartında nasıl evrilmiş,
   gelecek kartı bu gerilimi nasıl çözüyor? Üç ayrı paragraf değil, tek bir hikaye anlat.
5. Verilen kart anlamlarının (düz/ters açıklamaları, arketip, tavsiye) DIŞINA çıkma;
   onları kişinin sorusuna ve hayat evresine uyarla.`;

/* ─────────────────────────────────────────────────────────────────
 * HORARY (SORU ASTROLOJİSİ)
 * ───────────────────────────────────────────────────────────────── */
export const HORARY_REHBERI = `
HORARY OKUMA USULÜ (sadeleştirilmiş klasik yöntem):
1. KONUNUN EVİNİ BUL (quesited):
   - Aşk/flört/yeni ilişki → 5. ev ve Venüs; evlilik/mevcut ilişki/ortaklık → 7. ev
   - Kariyer/statü/terfi → 10. ev ve Satürn/Güneş; günlük iş/işyeri koşulları → 6. ev
   - Para/kazanç → 2. ev ve Jüpiter/Venüs; başkasının parası/borç/miras → 8. ev
   - Ev/taşınma/aile → 4. ev ve Ay; eğitim/sınav/kısa yol → 3. ev; yurt dışı/uzak yol/hukuk → 9. ev
   - Sağlık/düzen → 6. ev; arkadaşlar/umutlar → 11. ev; gizli konular/kayıplar → 12. ev
2. NİTELEYİCİLER: Soran kişiyi Yükselen'in yönetici gezegeni ve AY temsil eder;
   konuyu ilgili evin yöneticisi temsil eder. Ay her horary'de soran kişinin duygusal
   ortak niteleyicisidir — Ay'ın durumu, sorunun perde arkasındaki ruh halini anlatır.
3. HÜKÜM: Niteleyiciler arasında YAKLAŞAN uyumlu açı (üçgen/sekstil/kavuşum) = gelişen,
   olumlu sonuç. Yaklaşan sert açı (kare/karşıt) = sürtüşmeyle/bedeliyle gelen sonuç ya da
   engel. Açı yoksa/ayrılan açıysa = bu döngüde olgunlaşmamış, zamanı değil.
4. ZAMANLAMA: Yaklaşan açının derece farkı kabaca zaman birimidir (1 derece ≈ 1 gün/hafta/ay;
   öncü burçlar hızlı, sabit burçlar yavaş, değişken orta). Daima "yaklaşık" dilinde ver.
5. Retro gezegen ilgili evdeyse: gecikme, geri dönüş, yeniden gözden geçirme teması.
6. Cevap dili: teknik döküm yapma — evi/gezegeni EN FAZLA bir kez, kişinin anlayacağı
   şekilde an ("aşkını anlatan Venüs şu an...") ve hükmü net söyle.`;
