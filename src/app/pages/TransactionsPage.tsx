import { useState } from "react";
import { ReceiptText, Search, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export function TransactionsPage() {
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL");

  const filtered = orders.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "ALL" || tx.status === filterStatus;
    const matchType = filterType === "ALL" || tx.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalIn = filtered.filter(t => t.type === "IN" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-full p-4 md:p-7 flex flex-col gap-6" style={{ backgroundColor: "#07110a" }}>
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-black text-xl md:text-2xl">Riwayat Transaksi</h2>
          <p className="text-white/30 text-xs mt-0.5">Pusat data seluruh riwayat pesanan dan mutasi Rockopi</p>
        </div>
        <div className="flex items-center gap-2 bg-white/4 border border-white/8 px-4 py-2.5 rounded-xl">
          <ReceiptText size={16} className="text-blue-400" />
          <span className="text-white font-bold text-sm">{sorted.length} Transaksi</span>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-900/20 border border-green-400/15 rounded-2xl p-4">
          <p className="text-green-300/60 text-xs font-bold uppercase tracking-wider">Pemasukan (filter)</p>
          <p className="text-green-400 font-black text-xl mt-1">Rp {totalIn.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-red-900/20 border border-red-400/15 rounded-2xl p-4">
          <p className="text-red-300/60 text-xs font-bold uppercase tracking-wider">Pengeluaran (filter)</p>
          <p className="text-red-400 font-black text-xl mt-1">Rp {totalOut.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Cari nama pelanggan atau menu..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/4 text-white placeholder-white/20 pl-11 pr-4 py-2.5 rounded-xl border border-white/8 focus:border-green-400/40 outline-none text-sm transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PAID", "PENDING"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === s
                  ? s === "ALL" ? "bg-white/15 text-white" : s === "PAID" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                  : "bg-white/4 text-white/40 hover:bg-white/8"
              }`}>
              {s === "ALL" ? "Semua" : s === "PAID" ? "✓ Lunas" : "⏳ Pending"}
            </button>
          ))}
          <div className="w-px bg-white/8 hidden sm:block" />
          {(["ALL", "IN", "OUT"] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? t === "ALL" ? "bg-white/15 text-white" : t === "IN" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                  : "bg-white/4 text-white/40 hover:bg-white/8"
              }`}>
              {t === "ALL" ? "Semua Jenis" : t === "IN" ? "↑ Masuk" : "↓ Keluar"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead className="border-b border-white/8 bg-black/20">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                <th className="px-5 py-4 w-40">Tanggal & Waktu</th>
                <th className="px-5 py-4">Detail Transaksi</th>
                <th className="px-5 py-4 text-center w-28">Status</th>
                <th className="px-5 py-4 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-white/20 text-sm">Tidak ada transaksi yang sesuai.</td>
                </tr>
              ) : sorted.map(tx => {
                const isIn = tx.type === "IN";
                const isPaid = tx.status === "PAID";
                return (
                  <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white/50 text-xs font-bold">
                        {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-white/25 text-[10px] mt-0.5">
                        {new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm leading-snug">{tx.description}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block border ${
                        isIn ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"
                      }`}>
                        {isIn ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-400/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-400/20">
                          <CheckCircle size={11} /> LUNAS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-bold rounded-lg border border-yellow-400/20">
                          <Clock size={11} /> PENDING
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 text-right font-black text-sm ${isIn ? "text-green-400" : "text-red-400"}`}>
                      {isIn ? "+" : "−"} Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
