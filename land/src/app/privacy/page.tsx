import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Gizlilik Politikası | Valeria",
    description: "Valeria uygulaması gizlilik politikası ve kişisel verilerin korunması.",
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[#1a0a2e] text-purple-200">
            {/* ═══ NAV BAR ═══ */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1a0a2e]/70 border-b border-purple-500/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="Valeria"
                            width={40}
                            height={40}
                            className="rounded-xl"
                        />
                        <span className="text-xl font-bold gradient-text">Valeria</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium hover:text-[#f5c842] transition-colors"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </nav>

            <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-[#f5c842]">
                    Gizlilik Politikası
                </h1>

                <div className="space-y-8 text-purple-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Giriş</h2>
                        <p>
                            Valeria uygulamasına ("Uygulama") hoş geldiniz. Bu Gizlilik Politikası, Uygulama'yı,
                            ilgili hizmetleri ve özellikleri kullanırken bilgilerinizi nasıl topladığımızı,
                            kullandığımızı, koruduğumuzu ve açıkladığımızı açıklar.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Topladığımız Bilgiler</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Hesap Bilgileri:</strong> Kayıt sırasında ad, e-posta adresi ve şifre gibi
                                bilgiler toplayabiliriz.
                            </li>
                            <li>
                                <strong>Astrolojik ve Doğum Bilgileri:</strong> Natal harita ve fallar için doğum
                                tarihiniz, saatiniz ve doğum yeriniz analiz amacıyla işlenir.
                            </li>
                            <li>
                                <strong>Kullanım Verileri:</strong> Uygulamayı nasıl kullandığınıza (örneğin ziyaret
                                edilen sayfalar, bakılan fallar, uygulama içi etkileşimler) dair veriler otomatik
                                olarak toplanabilir.
                            </li>
                            <li>
                                <strong>Cihaz Bilgileri:</strong> Cihaz modeli, işletim sistemi sürümü ve benzersiz
                                cihaz tanımlayıcıları gibi teknik bilgiler.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Bilgilerin Kullanımı</h2>
                        <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Uygulamanın temel özelliklerini (Astroloji, Tarot vb.) sağlamak ve sürdürmek.</li>
                            <li>Size kişiselleştirilmiş astrolojik öngörüler ve fallar sunmak.</li>
                            <li>Müşteri desteği sağlamak ve geri bildirimlerinize yanıt vermek.</li>
                            <li>Uygulama performansını analiz etmek ve hizmetlerimizi iyileştirmek.</li>
                            <li>Satın alımları, abonelikleri (Premium) ve ödemeleri işlemek.</li>
                            <li>Yasal yükümlülüklere uymak ve dolandırıcılığı önlemek.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Bilgilerin Paylaşımı</h2>
                        <p>
                            Kişisel bilgilerinizi üçüncü partilere satmayız. Ancak belirli durumlarda bilgilerinizi
                            paylaşabiliriz:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                                <strong>Hizmet Sağlayıcılar:</strong> Sunucu barındırma, ödeme işleme ve veri
                                analizi hizmetleri aldığımız güvenilir iş ortakları.
                            </li>
                            <li>
                                <strong>Yasal Gereksinimler:</strong> Mahkeme kararı veya resmi bir yasal talebe
                                yanıt vermek amacıyla.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Veri Güvenliği</h2>
                        <p>
                            Kişisel verilerinizin güvenliği bizim için çok önemlidir. Bilgilerinizi korumak için
                            endüstri standardında güvenlik önlemleri ve şifreleme yöntemleri kullanıyoruz. Ancak,
                            hiçbir internet üzerinden aktarım veya elektronik depolama yönteminin %100 güvenli
                            garantisi olmadığını unutmayın.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Çocukların Gizliliği</h2>
                        <p>
                            Hizmetlerimiz 13 yaşın altındaki bireylere yönelik değildir. 13 yaşın altındaki
                            çocuklardan bilerek kişisel bilgi toplamıyoruz. Eğer böyle bir bilgi toplandığı
                            fark edilirse, derhal silinmesi için gerekli işlemler yapılacaktır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Haklarınız</h2>
                        <p>Aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Hakkınızda tuttuğumuz verilere erişim talep etme.</li>
                            <li>Yanlış veya eksik bilgilerinizi düzeltme.</li>
                            <li>Hesabınızın ve kişisel verilerinizin silinmesini (Unutulma Hakkı) talep etme.</li>
                        </ul>
                        <p className="mt-2">
                            Verilerinizi silmek için Uygulama içindeki Profil &gt; Ayarlar menüsünü kullanabilir
                            veya bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Değişiklikler</h2>
                        <p>
                            Bu Gizlilik Politikası zaman zaman güncellenebilir. Herhangi bir değişiklik olması
                            durumunda yenilenmiş politikayı bu sayfada yayınlayacağız ve önemli değişikliklerde
                            size Uygulama içi bildirim göndereceğiz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. İletişim</h2>
                        <p>
                            Gizlilik Politikamız veya kişisel verilerinizle ilgili sorularınız varsa, bizimle şu
                            adresten iletişime geçebilirsiniz:
                        </p>
                        <p className="mt-2 text-[#f5c842] font-semibold">support@valeria.today</p>
                    </section>

                    <p className="pt-8 text-sm text-purple-500">
                        Son Güncelleme: 25 Şubat 2026
                    </p>
                </div>
            </div>
        </main>
    );
}
