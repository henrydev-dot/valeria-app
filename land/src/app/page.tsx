"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

/* ─── DATA ─────────────────────────────────────── */
const ZODIAC = [
  { name: "Koç", img: "icons8-aries-100.png" },
  { name: "Boğa", img: "icons8-taurus-100.png" },
  { name: "İkizler", img: "icons8-gemini-100.png" },
  { name: "Yengeç", img: "icons8-cancer-100.png" },
  { name: "Aslan", img: "icons8-leo-100.png" },
  { name: "Başak", img: "icons8-virgo-100.png" },
  { name: "Terazi", img: "icons8-libra-100.png" },
  { name: "Akrep", img: "icons8-scorpio-100.png" },
  { name: "Yay", img: "icons8-sagittarius-100.png" },
  { name: "Oğlak", img: "icons8-capricorn-100.png" },
  { name: "Kova", img: "icons8-aquarius-100.png" },
  { name: "Balık", img: "icons8-pisces-100.png" },
];

const GODS = [
  "Aphrodite", "Apollo", "Artemis", "athena", "ares",
  "demeter", "hermes", "Hera", "zeus", "posedion",
  "Hephaestus", "hestia",
];

const TAROT_CARDS = Array.from({ length: 22 }, (_, i) => `${i}.jpeg`);

const FEATURES = [
  {
    icon: "🔮",
    title: "Tarot Falı",
    desc: "22 Major Arcana kartıyla günlük rehberlik al. Her kartın anlamıyla kozmik mesajlarını keşfet.",
  },
  {
    icon: "☕",
    title: "Kahve Falı",
    desc: "Fincandaki şekilleri yapay zeka ile yorumla. Geleneksel Türk kahve falı deneyimi.",
  },
  {
    icon: "⭐",
    title: "Natal Harita",
    desc: "Doğum anındaki gökyüzünün haritasını çıkar. Güneş, Ay ve yükselen burcunu öğren.",
  },
  {
    icon: "🔢",
    title: "Numeroloji",
    desc: "İsminin ve doğum tarihinin sayısal enerjisini keşfet. Yaşam yolu, kader ve ruh sayılarını öğren.",
  },
  {
    icon: "🌙",
    title: "Horary Astroloji",
    desc: "Sorunu sorduğun anın gökyüzünden cevap al. An'ın enerjisiyle doğru yönlendirme.",
  },
  {
    icon: "🏛️",
    title: "Mitolojik Rehber",
    desc: "Koruyucu tanrıçanı veya tanrını keşfet. Antik bilgelik ile modern yaşamını birleştir.",
  },
];

const STATS = [
  { value: "50K+", label: "Aktif Kullanıcı" },
  { value: "1M+", label: "Yapılan Yorum" },
  { value: "4.8", label: "App Store Puanı" },
  { value: "12", label: "Burç Desteği" },
];

/* ─── COMPONENT ────────────────────────────────── */
export default function LandingPage() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;
    const el = starsRef.current;
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--duration", `${2 + Math.random() * 4}s`);
      star.style.setProperty("--delay", `${Math.random() * 5}s`);
      star.style.width = star.style.height = `${1 + Math.random() * 2}px`;
      el.appendChild(star);
    }
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* ═══ NAV BAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1a0a2e]/70 border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Valeria"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-xl font-bold gradient-text">Valeria</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-purple-200">
            <a href="#features" className="hover:text-[#f5c842] transition-colors">Özellikler</a>
            <a href="#gallery" className="hover:text-[#f5c842] transition-colors">Galeri</a>
            <a href="#zodiac" className="hover:text-[#f5c842] transition-colors">Burçlar</a>
            <a href="/privacy" className="hover:text-[#f5c842] transition-colors">Gizlilik Politikası</a>
            <a href="/kullanim-sozlesmesi" className="hover:text-[#f5c842] transition-colors">Kullanım Sözleşmesi</a>
            <a href="#download" className="hover:text-[#f5c842] transition-colors">İndir</a>
          </div>
          <a
            href="#download"
            className="bg-[#f5c842] text-[#1a0a2e] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#ffd86e] transition-all hover:scale-105"
          >
            Hemen İndir
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-gradient relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div ref={starsRef} className="stars" />

        {/* Orbiting zodiac icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="orbit w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full border border-purple-500/10 relative">
            {ZODIAC.map((z, i) => {
              const angle = (360 / 12) * i;
              return (
                <div
                  key={z.name}
                  className="absolute w-8 h-8 opacity-20"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${angle}deg) translateX(min(300px, 40vw)) rotate(-${angle}deg)`,
                  }}
                >
                  <Image
                    src={`/images/burclar/${z.img}`}
                    alt={z.name}
                    width={32}
                    height={32}
                    className="brightness-0 invert opacity-40"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="float mb-8">
            <Image
              src="/images/logo.png"
              alt="Valeria"
              width={160}
              height={160}
              className="mx-auto rounded-3xl glow-purple"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Valeria</span>
            <br />
            <span className="text-3xl md:text-4xl text-purple-200 font-light">
              Kozmik Rehberin
            </span>
          </h1>

          <p className="text-lg md:text-xl text-purple-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Astroloji, tarot, kahve falı, numeroloji ve horary astroloji —
            tüm kozmik bilgelik tek bir uygulamada. Yıldızların rehberliğinde
            hayatını keşfet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#download"
              className="bg-[#f5c842] text-[#1a0a2e] px-8 py-4 rounded-full text-lg font-bold hover:bg-[#ffd86e] transition-all hover:scale-105 pulse-glow flex items-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.89C10.1 6.87 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
              App Store&apos;dan İndir
            </a>
            <a
              href="#features"
              className="border border-purple-400/30 text-purple-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-500/10 transition-all"
            >
              Keşfet ↓
            </a>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a0a2e] to-transparent" />
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative bg-[#1a0a2e] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-glow-gold text-[#f5c842]">
                {s.value}
              </div>
              <div className="text-sm text-purple-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 bg-[#1a0a2e] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="gradient-text">Özellikler</span>
            </h2>
            <p className="text-purple-300 text-lg max-w-xl mx-auto">
              Yıldızların gücüyle hayatına yön veren 6 ana özellik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="feature-card bg-[#2d1450]/50 border border-purple-500/15 rounded-2xl p-8"
              >
                <div className="text-5xl mb-5">{f.icon}</div>
                <h3 className="text-xl font-bold text-[#f5c842] mb-3">{f.title}</h3>
                <p className="text-purple-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ TAROT CARD GALLERY ═══ */}
      <section id="gallery" className="py-24 bg-[#0f0520] relative overflow-hidden">
        <div className="text-center mb-12 px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Tarot Kartları</span>
          </h2>
          <p className="text-purple-300 text-lg max-w-xl mx-auto">
            22 Major Arcana kartıyla kozmik mesajlarını keşfet
          </p>
        </div>

        {/* Scrolling carousel */}
        <div className="relative">
          <div className="flex scroll-cards gap-6 px-6" style={{ width: "fit-content" }}>
            {[...TAROT_CARDS, ...TAROT_CARDS].map((card, i) => (
              <div
                key={`card-${i}`}
                className="flex-shrink-0 w-40 md:w-48 rounded-xl overflow-hidden border border-purple-500/20 hover:border-[#f5c842]/50 transition-all hover:scale-105"
              >
                <Image
                  src={`/images/cards/${card}`}
                  alt={`Tarot ${card}`}
                  width={192}
                  height={320}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
          {/* Edge fades */}
          <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#0f0520] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#0f0520] to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ GODS ═══ */}
      <section className="py-24 bg-[#1a0a2e] relative overflow-hidden">
        <div className="text-center mb-12 px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Mitolojik Rehberler</span>
          </h2>
          <p className="text-purple-300 text-lg max-w-xl mx-auto">
            Antik tanrılar ve tanrıçalar kozmik yolculuğunda sana eşlik ediyor
          </p>
        </div>

        <div className="relative">
          <div className="flex scroll-gods gap-6 px-6" style={{ width: "fit-content" }}>
            {[...GODS, ...GODS].map((god, i) => (
              <div
                key={`god-${i}`}
                className="flex-shrink-0 w-48 md:w-56 group"
              >
                <div className="rounded-2xl overflow-hidden border border-purple-500/20 group-hover:border-[#f5c842]/40 transition-all group-hover:scale-105">
                  <Image
                    src={`/images/gods/${god}.jpeg`}
                    alt={god}
                    width={224}
                    height={280}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <p className="text-center text-purple-200 text-sm font-medium mt-3 capitalize">
                  {god}
                </p>
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#1a0a2e] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#1a0a2e] to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ ZODIAC GRID ═══ */}
      <section id="zodiac" className="py-24 bg-[#0f0520] relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="gradient-text">12 Burç</span>
            </h2>
            <p className="text-purple-300 text-lg max-w-xl mx-auto">
              Her burç için kişiselleştirilmiş günlük yorumlar
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {ZODIAC.map((z) => (
              <div
                key={z.name}
                className="feature-card bg-[#2d1450]/40 border border-purple-500/15 rounded-2xl p-5 text-center"
              >
                <Image
                  src={`/images/burclar/${z.img}`}
                  alt={z.name}
                  width={48}
                  height={48}
                  className="mx-auto mb-3 brightness-0 invert opacity-90"
                />
                <p className="text-sm font-medium text-purple-200">{z.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ MOON PHASES ═══ */}
      <section className="py-20 bg-[#1a0a2e]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              <span className="gradient-text">Ay Takibi</span>
            </h2>
            <p className="text-purple-300 max-w-lg mx-auto">
              Ay evrelerini takip et, enerji akışını anla
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
            {[
              "icons8-new-moon-100.png",
              "icons8-waxing-crescent-100.png",
              "icons8-first-quarter-100.png",
              "icons8-waxing-gibbous-100.png",
              "icons8-full-moon-100.png",
              "icons8-waning-gibbous-100.png",
              "icons8-last-quarter-100.png",
              "icons8-waning-crescent-100.png",
            ].map((moon) => (
              <div key={moon} className="text-center float-delay">
                <Image
                  src={`/images/ay/${moon}`}
                  alt="Ay Evresi"
                  width={48}
                  height={48}
                  className="mx-auto brightness-0 invert opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ PREMIUM ═══ */}
      <section className="py-24 bg-[#0f0520] relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#2d1450] to-[#1a0a2e] border border-[#f5c842]/20 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f5c842]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-block bg-[#f5c842]/10 border border-[#f5c842]/30 px-4 py-1 rounded-full text-[#f5c842] text-sm font-bold mb-6">
                ✨ Premium
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                <span className="gradient-text">Valeria Premium</span>
              </h2>
              <p className="text-purple-300 text-lg mb-10 max-w-xl mx-auto">
                Tüm özelliklere sınırsız erişim. Günlük ücretsiz sorular,
                ekstra kredi ve reklamsız deneyim.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#1a0a2e]/60 border border-purple-500/20 rounded-2xl p-6">
                  <div className="text-purple-300 text-sm font-bold mb-2">AYLIK</div>
                  <div className="text-4xl font-extrabold text-[#f5c842] mb-1">₺99</div>
                  <div className="text-purple-400 text-sm">/ ay</div>
                  <ul className="text-left text-sm text-purple-300 mt-4 space-y-2">
                    <li>✓ Günlük 2 ücretsiz soru</li>
                    <li>✓ Aylık 800 kredi</li>
                    <li>✓ Reklamsız deneyim</li>
                    <li>✓ Öncelikli destek</li>
                  </ul>
                </div>
                <div className="bg-[#1a0a2e]/60 border border-[#f5c842]/30 rounded-2xl p-6 relative">
                  <div className="absolute -top-3 right-4 bg-[#f5c842] text-[#1a0a2e] text-xs font-bold px-3 py-1 rounded-full">
                    %25 Kazanç
                  </div>
                  <div className="text-[#f5c842] text-sm font-bold mb-2">YILLIK</div>
                  <div className="text-4xl font-extrabold text-[#f5c842] mb-1">₺899</div>
                  <div className="text-purple-400 text-sm">/ yıl</div>
                  <ul className="text-left text-sm text-purple-300 mt-4 space-y-2">
                    <li>✓ Tüm aylık özellikler</li>
                    <li>✓ Yılda 9600 kredi</li>
                    <li>✓ Özel danışman erişimi</li>
                    <li>✓ VIP rozeti</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ DOWNLOAD CTA ═══ */}
      <section id="download" className="py-32 hero-gradient relative overflow-hidden">
        <div className="stars" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <Image
            src="/images/logo.png"
            alt="Valeria"
            width={120}
            height={120}
            className="mx-auto rounded-3xl glow-purple mb-8 float"
          />
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            Yıldızların <span className="gradient-text">Rehberliğinde</span>
          </h2>
          <p className="text-lg text-purple-300 mb-10 max-w-lg mx-auto">
            Valeria&apos;yı şimdi indir, kozmik yolculuğuna başla.
            Günlük burç yorumları, tarot falı ve çok daha fazlası.
          </p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-[#1a0a2e] px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-white/10"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.89C10.1 6.87 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
            </svg>
            App Store&apos;dan İndir
          </a>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0a0418] border-t border-purple-500/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/logo.png" alt="Valeria" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold gradient-text">Valeria</span>
              </div>
              <p className="text-purple-400 text-sm leading-relaxed">
                Astroloji, tarot ve kozmik bilgeliğin buluştuğu yer.
                Yıldızların rehberliğinde hayatını keşfet.
              </p>
            </div>
            <div>
              <h4 className="text-[#f5c842] font-bold mb-4 text-sm uppercase tracking-wider">Keşfet</h4>
              <ul className="space-y-2 text-purple-400 text-sm">
                <li><a href="#features" className="hover:text-[#f5c842] transition-colors">Özellikler</a></li>
                <li><a href="#gallery" className="hover:text-[#f5c842] transition-colors">Tarot Kartları</a></li>
                <li><a href="#zodiac" className="hover:text-[#f5c842] transition-colors">Burçlar</a></li>
                <li><a href="#download" className="hover:text-[#f5c842] transition-colors">İndir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#f5c842] font-bold mb-4 text-sm uppercase tracking-wider">Yasal</h4>
              <ul className="space-y-2 text-purple-400 text-sm">
                <li><a href="/privacy" className="hover:text-[#f5c842] transition-colors">Gizlilik Politikası</a></li>
                <li><a href="/terms" className="hover:text-[#f5c842] transition-colors">Kullanım Koşulları</a></li>
                <li><a href="/account-deletion" className="hover:text-[#f5c842] transition-colors">Hesap Silme</a></li>
                <li><a href="/support" className="hover:text-[#f5c842] transition-colors">Destek</a></li>
              </ul>
            </div>
          </div>
          <div className="section-divider mb-6" />
          <div className="text-center text-purple-500 text-xs">
            © 2025 Valeria. Tüm hakları saklıdır. Bu uygulamadaki içerikler eğlence amaçlıdır.
          </div>
        </div>
      </footer>
    </main>
  );
}
