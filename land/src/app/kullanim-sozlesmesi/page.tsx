import React from "react";
import Image from "next/image";

export default function KullanimSozlesmesi() {
    return (
        <main className="min-h-screen bg-[#1a0a2e]">
            {/* ═══ NAV BAR ═══ */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1a0a2e]/70 border-b border-purple-500/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="Valeria"
                            width={40}
                            height={40}
                            className="rounded-xl"
                        />
                        <span className="text-xl font-bold gradient-text">Valeria</span>
                    </a>
                    <div className="hidden md:flex items-center gap-8 text-sm text-purple-200">
                        <a href="/" className="hover:text-[#f5c842] transition-colors">Ana Sayfa</a>
                        <a href="/privacy" className="hover:text-[#f5c842] transition-colors">Gizlilik Politikası</a>
                    </div>
                    <a
                        href="/#download"
                        className="bg-[#f5c842] text-[#1a0a2e] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#ffd86e] transition-all hover:scale-105"
                    >
                        Hemen İndir
                    </a>
                </div>
            </nav>

            <section className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <div className="bg-[#1e0c36] border border-purple-500/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold text-center gradient-text mb-8">
                        Kullanım Sözleşmesi
                    </h1>

                    <div className="space-y-6 text-purple-100/80 leading-relaxed">
                        <p><strong>Son Güncelleme Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')}</p>

                        <p>Valeria Astroloji ve Fal Uygulamasına hoş geldiniz. Uygulamamızı indirerek ve kullanarak aşağıdaki şartları kabul etmiş olursunuz.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">1. Hizmetin Kapsamı</h2>
                        <p>Valeria, astrolojik hesaplamalar, kişiye özel haritalar, yapay zeka destekli tarot ve kahve falı yorumları ile gerçek danışmanlardan alınan profesyonel fal hizmetlerini sunan bir eğlence platformudur. Tüm yorumlar eğlence amaçlıdır ve kesin dogmatik ya da bilimsel bilgiler içermez.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">2. Eğlence Amacı ve Sorumluluk Reddi</h2>
                        <p>Uygulamamızdaki tüm okumalar (Yapay Zeka veya Gerçek Yorumcular tarafından sağlanan) yalnızca eğlence ve kişisel gelişim amaçlıdır. Verilen tavsiyeler hiçbir şekilde tıbbi, hukuki, finansal, psikolojik veya profesyonel bir kararın yerini tutamaz. Alınan kararlar tamamen kullanıcının kendi sorumluluğundadır.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">3. Premium Özellikler ve Krediler</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Uygulama içi satın alımlar (kredi paketleri ve premium abonelikler) Apple App Store ve Google Play Store üzerinden gerçekleştirilir.</li>
                            <li>Satın alınan krediler yalnızca uygulama içi hizmetler için kullanılabilir ve nakit paraya dönüştürülemez veya iade edilemez.</li>
                            <li>Premium abonelikler, kullanıcı tarafından iptal edilmediği sürece otomatik olarak yenilenir.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">4. Kullanıcı İçerikleri</h2>
                        <p>Fal yorumu için yüklediğiniz tüm görseller (örn: Kahve fincanı fotoğrafları) gizli tutulur ve yalnızca yorumun oluşturulması amacıyla işlenir. Yasa dışı, müstehcen veya 3. şahıs haklarını ihlal eden görsellerin yüklenmesi kesinlikle yasaktır.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">5. Fikri Mülkiyet</h2>
                        <p>Uygulama içerisindeki tüm tasarımlar, metinler, logolar, yazılımlar ve görseller Valeria'nın mülkiyetindedir. İzinsiz kullanılamaz, kopyalanamaz ve dağıtılamaz.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">6. Sözleşme Değişiklikleri</h2>
                        <p>Valeria yönetimi, bu Kullanım Sözleşmesi'nde önceden bildirmeksizin değişiklik yapma hakkını saklı tutar. Sözleşmenin güncel hali her zaman web sitemizde ve uygulama içerisinde yer alacaktır.</p>

                        <h2 className="text-xl font-semibold text-[#f5c842] mt-8 mb-4">7. İletişim</h2>
                        <p>Herhangi bir soru, öneri veya şikayetiniz için destek ekibimizle iletişime geçebilirsiniz.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
