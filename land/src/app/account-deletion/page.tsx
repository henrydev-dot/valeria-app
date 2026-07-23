import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Hesap Silme | Valeria",
    description: "Valeria hesabını ve tüm verilerini nasıl kalıcı olarak silersin.",
};

const DELETED = [
    "Profil bilgilerin (ad, e-posta, cinsiyet, ilişki/çalışma durumu)",
    "Doğum verilerin ve hesaplanan kozmik haritan (Güneş/Ay/Yükselen, arketip)",
    "Tüm fal, tarot ve kahve okuma geçmişin",
    "Kredilerin, XP, seviye ve üyelik durumun",
    "Danışman istekleri ve mesajların",
    "Bildirim (push) kaydın",
];

export default function AccountDeletionPage() {
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
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#f5c842]">Hesabını Sil</h1>
                <p className="text-purple-300 mb-10">
                    Hesabını ve tüm kişisel verilerini istediğin zaman kalıcı olarak silebilirsin. Bu işlem geri
                    alınamaz.
                </p>

                <section className="bg-[#1e0c36] border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-5">Uygulama içinden silme (önerilen)</h2>
                    <ol className="list-decimal pl-5 space-y-3 text-purple-300">
                        <li>Valeria uygulamasını aç ve giriş yap.</li>
                        <li><strong className="text-purple-100">Profil</strong> sekmesine git.</li>
                        <li><strong className="text-purple-100">Hesap &amp; Gizlilik</strong> bölümünde <strong className="text-purple-100">Hesabı Sil</strong>&apos;e dokun.</li>
                        <li>Onaylamak için <strong className="text-purple-100">SİL</strong> yaz ve işlemi onayla.</li>
                        <li>Hesabın ve tüm verilerin sunucularımızdan anında kalıcı olarak silinir.</li>
                    </ol>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Silinen veriler</h2>
                    <ul className="list-disc pl-5 space-y-2 text-purple-300">
                        {DELETED.map((d) => (
                            <li key={d}>{d}</li>
                        ))}
                    </ul>
                    <p className="text-purple-400 text-sm mt-4">
                        Not: Yasal olarak saklamamız gereken sınırlı kayıtlar (ör. fatura/işlem kayıtları) mevzuatın
                        gerektirdiği süre boyunca tutulabilir. Apple ile giriş yaptıysan, silme sırasında Apple
                        oturum anahtarların da iptal edilir.
                    </p>
                </section>

                <section className="bg-[#1e0c36] border border-purple-500/20 rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-white mb-3">Uygulamaya erişemiyor musun?</h2>
                    <p className="text-purple-300">
                        Cihazına erişimin yoksa, hesabınla ilişkili e-posta adresinden{" "}
                        <a href="mailto:support@valeria.today?subject=Hesap%20Silme%20Talebi" className="text-[#f5c842] hover:underline">
                            support@valeria.today
                        </a>{" "}
                        adresine "Hesap Silme Talebi" konusuyla yaz; kimliğini doğruladıktan sonra hesabını 7 gün
                        içinde sileriz.
                    </p>
                </section>
            </div>
        </main>
    );
}
