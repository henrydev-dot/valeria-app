import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Kullanım Koşulları | Valeria",
    description: "Valeria uygulaması kullanım koşulları ve hizmet şartları.",
};

const UPDATED = "1 Temmuz 2026";

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[#1a0a2e] text-purple-200">
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1a0a2e]/70 border-b border-purple-500/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/images/logo.png" alt="Valeria" width={40} height={40} className="rounded-xl" />
                        <span className="text-xl font-bold gradient-text">Valeria</span>
                    </Link>
                    <Link href="/" className="text-sm font-medium hover:text-[#f5c842] transition-colors">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </nav>

            <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#f5c842]">Kullanım Koşulları</h1>
                <p className="text-sm text-purple-400 mb-8">Son güncelleme: {UPDATED}</p>

                <div className="space-y-8 text-purple-300 leading-relaxed">
                    <section>
                        <p>
                            Valeria uygulamasını ("Uygulama") indirerek ve kullanarak bu Kullanım Koşullarını kabul
                            etmiş olursunuz. Koşulları kabul etmiyorsanız lütfen Uygulamayı kullanmayın.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Hizmetin Kapsamı</h2>
                        <p>
                            Valeria; astrolojik hesaplamalar, kişiye özel doğum haritası, tanrı arketipi kişilik
                            analizi, tarot, kahve falı ve numeroloji gibi içerikler sunan bir eğlence ve kişisel
                            içgörü platformudur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Eğlence Amacı ve Sorumluluk Reddi</h2>
                        <p>
                            Uygulamadaki tüm okumalar ve yorumlar yalnızca eğlence ve kişisel gelişim amaçlıdır ve
                            hiçbir şekilde tıbbi, hukuki, finansal veya psikolojik profesyonel tavsiye yerine geçmez.
                            Aldığınız kararlar tamamen kendi sorumluluğunuzdadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Uygunluk (Yaş)</h2>
                        <p>
                            Uygulamayı kullanabilmek için en az 17 yaşında olmanız veya ebeveyn/vasi onayına sahip
                            olmanız gerekir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Hesap ve Güvenlik</h2>
                        <p>
                            Hesabınızın ve giriş bilgilerinizin güvenliğinden siz sorumlusunuz. Hesabınızı istediğiniz
                            zaman Uygulama içinden <strong>Profil → Hesap &amp; Gizlilik → Hesabı Sil</strong> yolunu
                            izleyerek kalıcı olarak silebilirsiniz. Ayrıntılar için{" "}
                            <Link href="/account-deletion" className="text-[#f5c842] hover:underline">Hesap Silme</Link>{" "}
                            sayfasına bakın.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Krediler ve Satın Alımlar</h2>
                        <p>
                            Uygulama temel özellikleriyle ücretsizdir; krediler uygulama içi etkinliklerle kazanılır.
                            Uygulama içi satın alma sunulduğunda, tüm ödemeler Apple App Store üzerinden gerçekleşir;
                            satın alınan krediler nakde çevrilemez. Aboneliklerin yönetimi ve iptali Apple hesabınızın
                            ayarlarından yapılır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Kullanıcı İçerikleri</h2>
                        <p>
                            Kahve falı için yüklediğiniz fincan fotoğrafları yalnızca ilgili yorumun oluşturulması
                            amacıyla işlenir. Yasa dışı, müstehcen veya üçüncü kişilerin haklarını ihlal eden içerik
                            yüklemek yasaktır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Fikri Mülkiyet</h2>
                        <p>
                            Uygulamadaki tüm tasarım, metin, logo, yazılım ve görseller Valeria'ya aittir; izinsiz
                            kullanılamaz, kopyalanamaz veya dağıtılamaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Değişiklikler</h2>
                        <p>
                            Bu koşulları zaman zaman güncelleyebiliriz. Güncel sürüm her zaman bu sayfada yayınlanır;
                            önemli değişikliklerde Uygulama içinde bilgilendirme yapılır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. İletişim</h2>
                        <p>
                            Sorularınız için{" "}
                            <a href="mailto:support@valeria.today" className="text-[#f5c842] hover:underline">support@valeria.today</a>{" "}
                            adresinden bize ulaşabilir veya{" "}
                            <Link href="/support" className="text-[#f5c842] hover:underline">Destek</Link> sayfamızı
                            ziyaret edebilirsiniz.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
