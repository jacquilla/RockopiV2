import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Award, AlertCircle, Calendar, Trash2, PlusCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type FilterType = "DAILY" | "WEEKLY" | "MONTHLY";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateRange(filterType: FilterType, selectedDate: string): { start: Date; end: Date } {
  const [y, m, day] = selectedDate.split("-").map(Number);
  let start = new Date(y, m - 1, day, 0, 0, 0, 0);
  let end = new Date(y, m - 1, day, 23, 59, 59, 999);

  if (filterType === "WEEKLY") {
    const dow = start.getDay();
    const diff = start.getDate() - dow + (dow === 0 ? -6 : 1);
    start = new Date(y, m - 1, diff, 0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (filterType === "MONTHLY") {
    start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    end = new Date(y, m, 0, 23, 59, 59, 999);
  }
  return { start, end };
}

export function FinancePage() {
  const { orders, deleteOrder, addExpense } = useApp();
  const [filterType, setFilterType] = useState<FilterType>("DAILY");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { start, end } = getDateRange(filterType, selectedDate);

  const validTx = useMemo(() => orders.filter(o => {
    const d = new Date(o.created_at);
    if (d < start || d > end) return false;
    if (o.type === "IN" && o.status !== "PAID") return false;
    return true;
  }), [orders, start, end]);

  const stats = useMemo(() => {
    let omset = 0, expense = 0;
    validTx.forEach(tx => {
      if (tx.type === "IN") omset += tx.amount;
      else expense += tx.amount;
    });
    return { omset, expense, net: omset - expense };
  }, [validTx]);

  const menuCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    validTx.forEach(tx => {
      if (tx.type !== "IN") return;
      const parts = tx.description.split(" - ");
      if (parts.length < 2) return;
      parts[1].split(" & ").forEach(token => {
        const m = token.match(/(\d+)x\s+(.+)/);
        if (m) { const qty = parseInt(m[1]); const name = m[2].trim(); counts[name] = (counts[name] || 0) + qty; }
      });
    });
    return Object.entries(counts).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
  }, [validTx]);

  const chartData = menuCounts.slice(0, 6).map((item, i) => ({
    name: item.name.length > 12 ? item.name.slice(0, 12) + "…" : item.name,
    qty: item.qty,
    fill: ["#22c55e", "#4ade80", "#86efac", "#f59e0b", "#f97316", "#ef4444"][i] || "#22c55e",
  }));

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));
    addExpense(description, Number(amount));
    setDescription("");
    setAmount("");
    setIsSaving(false);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#0e1f13] border border-white/10 rounded-xl px-3 py-2 text-xs">
          <p className="text-white font-bold">{payload[0].payload.name}</p>
          <p className="text-green-400 font-black">{payload[0].value} Cup</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full p-4 md:p-7 flex flex-col gap-6" style={{ backgroundColor: "#07110a" }}>
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl md:text-2xl">Pembukuan Finansial</h2>
          <p className="text-white/30 text-xs mt-0.5">Laporan keuangan dan analisis menu Rockopi</p>
        </div>
      </header>

      {/* Filter */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
          {(["DAILY", "WEEKLY", "MONTHLY"] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterType === f ? "text-white shadow-lg" : "text-white/30 hover:text-white/60"
              }`}
              style={filterType === f ? { backgroundColor: "#1B4332" } : {}}>
              {f === "DAILY" ? "Harian" : f === "WEEKLY" ? "Mingguan" : "Bulanan"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/4 px-3 py-2 rounded-xl border border-white/8">
          <Calendar size={14} className="text-yellow-400" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Pendapatan</p>
          </div>
          <p className="text-green-400 font-black text-2xl">Rp {stats.omset.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-400" />
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Pengeluaran</p>
          </div>
          <p className="text-red-400 font-black text-2xl">Rp {stats.expense.toLocaleString("id-ID")}</p>
        </div>
        <div className={`border rounded-2xl p-5 ${stats.net >= 0 ? "bg-green-900/20 border-green-400/20" : "bg-red-900/20 border-red-400/20"}`}>
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Laba Bersih</p>
          <p className={`font-black text-2xl ${stats.net >= 0 ? "text-white" : "text-red-400"}`}>
            {stats.net >= 0 ? "+" : ""}Rp {stats.net.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: charts + table */}
        <div className="lg:col-span-2 space-y-5">
          {/* Bar chart */}
          {chartData.length > 0 && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award size={14} className="text-green-400" /> Penjualan Per Menu
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#ffffff30", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="qty" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Best / Worst sellers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h4 className="text-green-300 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award size={14} /> Best Seller
              </h4>
              {menuCounts.length === 0 ? (
                <p className="text-white/20 text-xs">Belum ada data penjualan.</p>
              ) : menuCounts.slice(0, 4).map((item, i) => (
                <div key={item.name} className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50 truncate w-3/4">{i + 1}. {item.name}</span>
                    <span className="text-green-400 font-black">{item.qty} Cup</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                      style={{ width: `${Math.min((item.qty / menuCounts[0].qty) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> Kurang Laku
              </h4>
              {menuCounts.length === 0 ? (
                <p className="text-white/20 text-xs">Belum ada data produk terjual.</p>
              ) : [...menuCounts].reverse().slice(0, 4).map((item, i) => (
                <div key={item.name} className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50 truncate w-3/4">{i + 1}. {item.name}</span>
                    <span className="text-red-400 font-black">{item.qty} Cup</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                      style={{ width: `${Math.max((item.qty / menuCounts[0].qty) * 100, 8)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Daftar Aliran Dana</span>
              <span className="text-white/30 text-xs">{validTx.length} transaksi</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 sticky top-0">
                  <tr className="text-[9px] font-bold uppercase text-white/20">
                    <th className="px-5 py-3">Waktu</th>
                    <th className="px-5 py-3">Keterangan</th>
                    <th className="px-5 py-3 text-right">Jumlah</th>
                    <th className="px-3 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-xs">
                  {validTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 text-white/30 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-5 py-3 text-white/60 max-w-[200px] truncate">{tx.description}</td>
                      <td className={`px-5 py-3 text-right font-black ${tx.type === "IN" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "IN" ? "+" : "−"} Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => deleteOrder(tx.id)} className="text-white/15 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: expense form */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 lg:sticky lg:top-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-green-400" /> Input Pengeluaran
          </h3>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Deskripsi pengeluaran..."
              className="w-full bg-white/4 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-red-400/40 outline-none text-sm transition-all"
              required />
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Jumlah (Rp)"
              className="w-full bg-white/4 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-red-400/40 outline-none text-sm transition-all"
              required />
            <button type="submit" disabled={isSaving}
              className="w-full py-3 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
