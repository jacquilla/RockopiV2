import { useState, useEffect } from "react";
import { ChefHat, CreditCard, Trash2, Clock, BellDot, Activity, Receipt, Users, CheckSquare, Loader2, Coffee, X } from "lucide-react";
import { useApp, type Order } from "../context/AppContext";

function getCustomerName(desc: string) {
  const m = desc.match(/A\/N \[(.*?)\]/);
  return m ? m[1] : "Pelanggan Umum";
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden sm:flex items-center gap-3 bg-white/4 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/8">
      <Clock className="text-green-400" size={20} />
      <div>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Waktu Live</p>
        <p className="text-white font-black text-lg tabular-nums">{time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { orders, updateOrderStatus, deleteOrder } = useApp();
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const activeOrders = orders.filter(o => o.type === "IN" && (o.status === "PENDING" || o.production_status === "PENDING"));
  const unpaidReady = orders.filter(o => o.type === "IN" && o.status === "PENDING" && o.production_status === "DONE");
  const paidToday = orders.filter(o => o.type === "IN" && o.status === "PAID" && new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = paidToday.reduce((s, o) => s + o.amount, 0);

  const groupedBills = unpaidReady.reduce<Record<string, Order[]>>((acc, o) => {
    const n = getCustomerName(o.description);
    if (!acc[n]) acc[n] = [];
    acc[n].push(o);
    return acc;
  }, {});

  const handleAction = async (order: Order) => {
    if (isUpdating === order.id) return;
    setIsUpdating(order.id);
    await new Promise(r => setTimeout(r, 300));
    if (order.production_status === "PENDING") {
      updateOrderStatus(order.id, "production_status", "DONE");
    } else if (order.status === "PENDING") {
      updateOrderStatus(order.id, "status", "PAID");
    }
    setIsUpdating(null);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Hapus pesanan ini?")) return;
    deleteOrder(id);
  };

  const handlePayGroup = (customerName: string) => {
    if (!window.confirm(`Tandai semua tagihan ${customerName} sebagai lunas?`)) return;
    groupedBills[customerName].forEach(o => updateOrderStatus(o.id, "status", "PAID"));
    setSelectedCustomer(null);
    if (Object.keys(groupedBills).length <= 1) setIsRecapOpen(false);
  };

  const handlePaySingle = (order: Order) => {
    updateOrderStatus(order.id, "status", "PAID");
  };

  return (
    <div className="min-h-full p-4 md:p-7 flex flex-col gap-6" style={{ backgroundColor: "#07110a" }}>

      {/* Recap Modal */}
      {isRecapOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0e1f13] border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center justify-between bg-black/30">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Receipt className="text-yellow-400" size={20} /> Rekap Tagihan
              </h3>
              <button onClick={() => { setIsRecapOpen(false); setSelectedCustomer(null); }}
                className="text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {Object.keys(groupedBills).length === 0 ? (
                <p className="text-white/30 text-center py-10 text-sm">Tidak ada tagihan yang menunggu pembayaran.</p>
              ) : Object.keys(groupedBills).map(name => {
                const total = groupedBills[name].reduce((s, o) => s + o.amount, 0);
                const isExp = selectedCustomer === name;
                return (
                  <div key={name} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/4 transition-colors"
                      onClick={() => setSelectedCustomer(isExp ? null : name)}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400/10 rounded-xl"><Users size={18} className="text-yellow-400" /></div>
                        <div>
                          <p className="text-white font-bold text-sm">{name}</p>
                          <p className="text-white/30 text-xs">{groupedBills[name].length} item</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-black text-lg">Rp {total.toLocaleString("id-ID")}</p>
                        <p className="text-white/20 text-[10px]">Klik untuk detail</p>
                      </div>
                    </div>
                    {isExp && (
                      <div className="bg-black/30 border-t border-white/5 p-4 space-y-2">
                        {groupedBills[name].map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                            <span className="text-white/50 w-2/3 truncate">{item.description.replace(`A/N [${name}] - `, "")}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">Rp {item.amount.toLocaleString("id-ID")}</span>
                              <button onClick={() => handlePaySingle(item)}
                                className="p-1.5 bg-green-500 hover:bg-green-400 rounded-lg text-white transition-all">
                                <CheckSquare size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => handlePayGroup(name)}
                          className="w-full mt-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl text-sm transition-all">
                          LUNAS SEMUA (Rp {total.toLocaleString("id-ID")})
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Antrian Aktif", value: activeOrders.length, unit: "pesanan", color: "#22c55e" },
          { label: "Menunggu Bayar", value: unpaidReady.length, unit: "tagihan", color: "#f59e0b" },
          { label: "Pendapatan Hari Ini", value: `Rp ${(todayRevenue / 1000).toFixed(0)}K`, unit: "", color: "#4ade80" },
        ].map(s => (
          <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-3 md:p-4">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
            <p className="font-black mt-1 text-lg md:text-2xl" style={{ color: s.color }}>{s.value}</p>
            {s.unit && <p className="text-white/30 text-xs">{s.unit}</p>}
          </div>
        ))}
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-black text-xl md:text-2xl">Rockopi Dashboard</h2>
          <p className="text-white/30 text-xs mt-0.5">Sistem operasional terpadu · Order First, Pay Later</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsRecapOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg">
            <Receipt size={16} /> Rekap Tagihan
            {unpaidReady.length > 0 && (
              <span className="bg-black/20 text-black text-[9px] px-1.5 py-0.5 rounded-full">{Object.keys(groupedBills).length}</span>
            )}
          </button>
          <LiveClock />
        </div>
      </div>

      {/* Order queue */}
      <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden flex-1">
        <div className="border-b border-white/8 px-5 py-4 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <BellDot size={18} className="text-green-400 animate-pulse" />
            <span className="text-white font-bold text-sm">Antrean Berjalan</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/8">
            <Activity size={12} className="text-green-300" />
            <span className="text-white/60 font-bold">{activeOrders.length} Pesanan</span>
          </div>
        </div>

        <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Coffee size={40} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/30 font-bold">Dapur bersih!</p>
              <p className="text-white/20 text-xs mt-1">Belum ada pesanan masuk.</p>
            </div>
          ) : activeOrders.map(order => {
            const isPendingProd = order.production_status === "PENDING";
            return (
              <div key={order.id} className={`relative border rounded-2xl p-4 flex flex-col gap-3 overflow-hidden group transition-all hover:-translate-y-0.5 shadow-xl ${
                isPendingProd ? "bg-blue-950/40 border-blue-400/20 hover:border-blue-400/40" : "bg-green-950/40 border-green-400/20 hover:border-green-400/40"
              }`}>
                <div className="absolute -right-3 -top-3 opacity-5 pointer-events-none">
                  {isPendingProd ? <ChefHat size={100} /> : <CreditCard size={100} />}
                </div>

                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/40 rounded-lg text-white/50 border border-white/5">
                    {formatTime(order.created_at)}
                  </span>
                  <button onClick={() => handleDelete(order.id)} className="text-white/20 hover:text-red-400 p-1 bg-black/20 rounded-lg transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>

                <p className="text-white font-bold text-sm leading-snug z-10">{order.description}</p>

                {!isPendingProd && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/15 border border-green-400/20 rounded-lg text-green-300 text-[10px] font-bold w-fit">
                    ✓ Siap Diantar
                  </span>
                )}

                <div className="text-right z-10">
                  <span className="text-white/60 font-black text-base">Rp {order.amount.toLocaleString("id-ID")}</span>
                </div>

                <button onClick={() => handleAction(order)} disabled={isUpdating === order.id}
                  className={`z-10 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border disabled:opacity-50 ${
                    isPendingProd
                      ? "bg-blue-500 hover:bg-blue-400 border-blue-300/20 text-white"
                      : "bg-green-500 hover:bg-green-400 border-green-300/20 text-white"
                  }`}>
                  {isUpdating === order.id ? <Loader2 size={16} className="animate-spin" />
                    : isPendingProd ? <><ChefHat size={15} /> Selesai Dibuat</>
                    : <><CreditCard size={15} /> Tandai Lunas</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
