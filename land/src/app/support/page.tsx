import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Destek | Valeria",
    description: "Valeria uygulaması destek ve iletişim. Sorularınız, geri bildirimleriniz ve hesap yardımı.",
};

const FAQ = [
    {
        q: "Doğum saatimi bilmiyorum, yine de kullanabilir miyim?",
        a: "Evet. Doğum saati adımında \"Doğum saatimi bilmiyorum\" seçeneğini işaretleyebilirsin; Güneş ve Ay burcun yine doğru hesaplanır, Yükselen burcun yaklaşık olur.",
    },
    {
        q: "Kredileri nasıl kazanırım?",
        a: "Krediler günlük ödül, giriş serisi (streak) ve seviye atlayarak kazanılır. İlk sorun ücretsizdir.",
    },
    {
        q: "Hesabımı nasıl silerim?",
        a: "Uygulamada Profil → Hesap & Gizlilik → Hesabı Sil yolunu izle. Hesabın ve tüm verilerin kalıcı olarak silinir. Ayrıntılar Hesap Silme sayfasında.",
    },
    {
        q: "Okumalar gerçek mi?",
        a: "Valeria bir eğlence ve kişisel içgörü uygulamasıdır. İçerikler profesyonel tıbbi, hukuki veya finansal tavsiye yerine geçmez.",
    },
];

export default function SupportPage() {
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
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#f5c842]">Destek &amp; İletişim</h1>
                <p className="text-purple-300 mb-10">
                    Sorularını, geri bildirimlerini ve hesap yardımı taleplerini memnuniyetle karşılıyoruz.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-[#1e0c36] border border-purple-500/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-2">E-posta</h2>
                        <p className="text-purple-300 mb-3">Genellikle 48 saat içinde yanıt veriyoruz.</p>
                        <a href="mailto:support@valeria.today" className="text-[#f5c842] font-semibold hover:underline">
                            support@valeria.today
                        </a>
                    </div>
                    <div className="bg-[#1e0c36] border border-purple-500/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Hesap &amp; Gizlilik</h2>
                        <p className="text-purple-300 mb-3">Verilerini yönet veya hesabını sil.</p>
                        <div className="flex flex-col gap-1">
                            <Link href="/privacy" className="text-[#f5c842] hover:underline">Gizlilik Politikası</Link>
                            <Link href="/account-deletion" className="text-[#f5c842] hover:underline">Hesap Silme</Link>
                            <Link href="/terms" className="text-[#f5c842] hover:underline">Kullanım Koşulları</Link>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-6">Sık Sorulan Sorular</h2>
                <div className="space-y-5">
                    {FAQ.map((item) => (
                        <div key={item.q} className="bg-[#1e0c36] border border-purple-500/20 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-[#f5c842] mb-2">{item.q}</h3>
                            <p className="text-purple-300 leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
