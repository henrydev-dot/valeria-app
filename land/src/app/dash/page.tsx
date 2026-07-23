"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    premiumUsers: number;
    totalReadings: number;
    recentUsers: Array<{ _id: string; email?: string; name?: string; createdAt: string }>;
    status: string;
    uptime: number;
}

interface Reading {
    _id: string;
    userId: string;
    type: string;
    createdAt: string;
    status: string;
}

interface ReadingRequest {
    _id: string;
    userId: string;
    advisorId: string;
    type: string;
    question: string;
    status: string;
    createdAt: string;
    images?: string[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ReadingRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    // Push notification state
    const [pushTitle, setPushTitle] = useState("");
    const [pushBody, setPushBody] = useState("");
    const [sendingPush, setSendingPush] = useState(false);
    const [pushResult, setPushResult] = useState("");

    // Reply state
    const [selectedRequest, setSelectedRequest] = useState<ReadingRequest | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, readingsRes, requestsRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/readings?limit=10"),
                fetch("/api/admin/requests"),
            ]);

            if (!statsRes.ok || !readingsRes.ok || !requestsRes.ok) throw new Error("Veri çekilemedi.");

            const statsData = await statsRes.json();
            const readingsData = await readingsRes.json();
            const requestsData = await requestsRes.json();

            setStats(statsData);
            setReadings(readingsData.readings);
            setPendingRequests(requestsData.requests || []);
        } catch (err: any) {
            setError(err.message || "Bilinmeyen bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchDashboardData();
        // Auto refresh every 30s
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "valeria2026") {
            setIsAuthenticated(true);
            setAuthError("");
        } else {
            setAuthError("Hatalı şifre!");
        }
    };

    const handleSendPush = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pushTitle || !pushBody) return;
        setSendingPush(true);
        setPushResult("");

        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: pushTitle, body: pushBody }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPushResult(`Başarılı! ${data.sentCount} cihaza gönderildi.`);
                setPushTitle("");
                setPushBody("");
            } else {
                setPushResult(`Hata: ${data.message || data.error}`);
            }
        } catch (err) {
            setPushResult("İstek başarısız oldu.");
        } finally {
            setSendingPush(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !replyText) return;
        setSendingReply(true);

        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer: replyText }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert("Cevap başarıyla gönderildi!");
                setSelectedRequest(null);
                setReplyText("");
                fetchDashboardData(); // Refresh list
            } else {
                alert(`Hata: ${data.message || data.error}`);
            }
        } catch (err) {
            alert("İstek başarısız oldu.");
        } finally {
            setSendingReply(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-[#0f0520] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-[#1a0a2e] border border-purple-500/20 rounded-3xl p-8 text-center">
                    <Image src="/images/logo.png" alt="Valeria Admin" width={80} height={80} className="mx-auto rounded-2xl mb-6 shadow-lg shadow-purple-500/20" />
                    <h1 className="text-2xl font-bold text-white mb-2">Valeria Admin</h1>
                    <p className="text-purple-400 text-sm mb-8">Devam etmek için yönetici şifresini girin.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifreyi girin..."
                            className="w-full bg-[#0f0520] border border-purple-500/30 rounded-xl px-4 py-3 text-white text-center tracking-widest focus:outline-none focus:border-[#a855f7] transition-all"
                            autoFocus
                        />
                        {authError && <p className="text-red-400 text-sm">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#0f0520] flex items-center justify-center flex-col gap-4 text-purple-200">
                <div className="w-8 h-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                <p>Veriler Yükleniyor...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0f0520] text-purple-200 p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Valeria" width={48} height={48} className="rounded-xl hover:scale-105 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#f5c842]">Sistem Paneli</h1>
                            <p className="text-sm text-purple-400">Canlı Metrikler & Uygulama Yönetimi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${stats?.status === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400'}`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            API: {stats?.status.toUpperCase()}
                        </div>
                        <button onClick={fetchDashboardData} className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors">
                            🔄 Yenile
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
                        {error}
                    </div>
                )}

                {/* METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1a0a2e] border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-colors" />
                        <h3 className="text-purple-400 text-sm font-medium mb-2">Toplam Kullanıcı</h3>
                        <p className="text-4xl font-extrabold text-white">{stats?.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#1a0a2e] border border-[#f5c842]/20 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5c842]/5 rounded-bl-full group-hover:bg-[#f5c842]/10 transition-colors" />
                        <h3 className="text-purple-400 text-sm font-medium mb-2">Premium Kullanıcılar</h3>
                        <p className="text-4xl font-extrabold text-[#f5c842]">{stats?.premiumUsers.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#1a0a2e] border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors" />
                        <h3 className="text-purple-400 text-sm font-medium mb-2">Toplam Bakılan Fal</h3>
                        <p className="text-4xl font-extrabold text-blue-400">{stats?.totalReadings.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* RECENT READINGS */}
                    <div className="bg-[#1a0a2e] border border-purple-500/20 rounded-2xl flex flex-col">
                        <div className="p-6 border-b border-purple-500/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Son Fal İstekleri</h2>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Canlı</span>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#2d1450]/30 text-purple-300 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Tip</th>
                                        <th className="px-6 py-4 font-medium">Tarih</th>
                                        <th className="px-6 py-4 font-medium text-right">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-500/10">
                                    {readings.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-purple-400">Henüz fal isteği yok.</td></tr>
                                    ) : (
                                        readings.map((r) => (
                                            <tr key={r._id} className="hover:bg-purple-500/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white capitalize">{r.type}</td>
                                                <td className="px-6 py-4 text-purple-400">
                                                    {new Date(r.createdAt).toLocaleString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        r.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-8 flex flex-col">
                        {/* RECENT USERS */}
                        <div className="bg-[#1a0a2e] border border-purple-500/20 rounded-2xl">
                            <div className="p-6 border-b border-purple-500/10">
                                <h2 className="text-xl font-bold text-white">Yeni Kullanıcılar</h2>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                                    stats.recentUsers.map(user => (
                                        <div key={user._id} className="flex justify-between items-center bg-[#2d1450]/20 p-3 rounded-xl">
                                            <div>
                                                <div className="text-sm text-white font-medium">{user.email || 'Anonim Kullanıcı'}</div>
                                                <div className="text-xs text-purple-400">ID: {user._id.substring(0, 8)}...</div>
                                            </div>
                                            <div className="text-xs text-purple-300">
                                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-purple-400 text-center py-4">Kullanıcı bulunamadı.</p>
                                )}
                            </div>
                        </div>

                        {/* PENDING REQUESTS */}
                        <div className="bg-[#1a0a2e] border border-[#f5c842]/30 rounded-2xl flex-1 flex flex-col">
                            <div className="p-6 border-b border-[#f5c842]/20 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[#f5c842]">Bekleyen Danışman İstekleri</h2>
                                <span className="bg-[#f5c842] text-[#1a0a2e] text-xs font-bold px-2 py-1 rounded-full">
                                    {pendingRequests.length}
                                </span>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#f5c842]/10 text-[#f5c842] text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Soru / Tip</th>
                                            <th className="px-6 py-4 font-medium">Tarih</th>
                                            <th className="px-6 py-4 font-medium text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-500/10">
                                        {pendingRequests.length === 0 ? (
                                            <tr><td colSpan={3} className="px-6 py-8 text-center text-purple-400">Bekleyen istek yok.</td></tr>
                                        ) : (
                                            pendingRequests.map((r) => (
                                                <tr key={r._id} className="hover:bg-purple-500/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white mb-1">
                                                            {r.question.length > 50 ? r.question.substring(0, 50) + "..." : r.question}
                                                        </div>
                                                        <div className="text-xs text-purple-400 uppercase">{r.type} - Danışman: {r.advisorId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-purple-400">
                                                        {new Date(r.createdAt).toLocaleString('tr-TR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedRequest(r)}
                                                            className="bg-[#f5c842] hover:bg-[#ffd86e] text-[#1a0a2e] text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            Cevapla
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SEND PUSH NOTIFICATION */}
                        <div className="bg-gradient-to-br from-[#1a0a2e] to-[#2d1450]/40 border border-[#a855f7]/30 rounded-2xl flex-1">
                            <div className="p-6 border-b border-purple-500/10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    📢 Push Bildirimi Gönder
                                </h2>
                                <p className="text-xs text-purple-400 mt-1">İzin veren tüm kullanıcılara anında iletilir.</p>
                            </div>
                            <form onSubmit={handleSendPush} className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        required
                                        value={pushTitle}
                                        onChange={e => setPushTitle(e.target.value)}
                                        placeholder="Örn: Günlük Falın Hazır!"
                                        className="w-full bg-[#0f0520] border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#a855f7] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-1">Mesaj İçeriği</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={pushBody}
                                        onChange={e => setPushBody(e.target.value)}
                                        placeholder="Yıldızların sana mesajı var..."
                                        className="w-full bg-[#0f0520] border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#a855f7] transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sendingPush}
                                    className="mt-2 w-full bg-[#a855f7] hover:bg-[#8b5cf6] disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                                >
                                    {sendingPush ? 'Gönderiliyor...' : 'Tüm Kullanıcılara Gönder'}
                                </button>

                                {pushResult && (
                                    <div className={`p-3 rounded-lg text-sm mt-2 ${pushResult.includes('Başarılı') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {pushResult}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

            </div>

            {/* REPLY MODAL */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
                    <div className="bg-[#1a0a2e] border border-[#f5c842]/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 md:p-8 relative">
                        <button
                            onClick={() => { setSelectedRequest(null); setReplyText(""); }}
                            className="absolute top-6 right-6 text-purple-400 hover:text-white"
                        >
                            ✕ Kapat
                        </button>

                        <h2 className="text-2xl font-bold text-[#f5c842] mb-6">Falı Cevapla</h2>

                        <div className="bg-[#0f0520] border border-purple-500/20 rounded-xl p-5 mb-6">
                            <div className="flex gap-4 text-sm text-purple-400 mb-2 font-medium capitalize">
                                <span>Tip: {selectedRequest.type}</span>
                                <span>•</span>
                                <span>Danışman: {selectedRequest.advisorId}</span>
                                <span>•</span>
                                <span>Tarih: {new Date(selectedRequest.createdAt).toLocaleString('tr-TR')}</span>
                            </div>
                            <p className="text-white text-lg leading-relaxed">{selectedRequest.question}</p>

                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                                    {selectedRequest.images.map((img, idx) => (
                                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-purple-500/30">
                                            <Image src={img} alt="Fal Görseli" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendReply} className="flex flex-col gap-4">
                            <label className="text-sm font-medium text-purple-300">Yorumunu Yaz</label>
                            <textarea
                                required
                                rows={8}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Kullanıcıya özel fal yorumunu buraya gir..."
                                className="w-full bg-[#0f0520] border border-purple-500/30 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#f5c842] transition-colors resize-y text-sm leading-relaxed"
                            />

                            <button
                                type="submit"
                                disabled={sendingReply}
                                className="mt-2 w-full bg-[#f5c842] hover:bg-[#ffd86e] disabled:opacity-50 text-[#1a0a2e] font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-[#f5c842]/20"
                            >
                                {sendingReply ? 'Gönderiliyor...' : 'Cevabı Gönder & Tamamla'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
