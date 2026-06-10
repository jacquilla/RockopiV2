import { useState } from "react";
import { Minus, Plus, ShoppingCart, Send, X, UserCircle2, Loader2, Coffee } from "lucide-react";
import { useApp, type Category } from "../context/AppContext";
import { Link } from "react-router";

const CATEGORIES: Category[] = ["Hot Coffee", "Iced Coffee", "Non Coffee"];

const CATEGORY_LABELS: Record<Category, string> = {
  "Hot Coffee": "☕ Hot Coffee",
  "Iced Coffee": "🧊 Iced Coffee",
  "Non Coffee": "🍵 Non Coffee",
};

export function OrderPage() {
  const { products, addOrder } = useApp();
  const [orderItems, setOrderItems] = useState<Record<number, number>>({});
  const [activeCategory, setActiveCategory] = useState<Category>("Hot Coffee");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleIncrease = (id: number) => setOrderItems(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const handleDecrease = (id: number) => setOrderItems(p => {
    const next = { ...p, [id]: Math.max((p[id] || 0) - 1, 0) };
    if (next[id] === 0) delete next[id];
    return next;
  });

  const totalItems = Object.values(orderItems).reduce((a, b) => a + b, 0);
  const totalPrice = products.reduce((t, item) => t + item.price * (orderItems[item.id] || 0), 0);

  const handleSubmit = async () => {
    if (totalItems === 0) return;
    if (!customerName.trim()) {
      alert("Mohon isi nama Anda terlebih dahulu!");
      return;
    }
    setIsSubmitting(true);
    const orderedItems = products.filter(p => orderItems[p.id] > 0);
    const detail = orderedItems.map(p => `${orderItems[p.id]}x ${p.name}`).join(" & ");
    await new Promise(r => setTimeout(r, 600));
    addOrder({
      description: `A/N [${customerName.trim().toUpperCase()}] - ${detail}`,
      amount: totalPrice,
      type: "IN",
    });
    setOrderItems({});
    setCustomerName("");
    setIsSubmitting(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const filteredMenu = products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: "linear-gradient(135deg, #07110a 0%, #0f2318 40%, #0a1a0e 100%)" }}>
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #1B4332 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white bg-white/10 p-2 rounded-full" onClick={() => setPreviewImage(null)}>
              <X size={22} />
            </button>
            <img src={previewImage} alt="Preview" className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      )}

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-bounce text-sm">
          ✓ Pesanan berhasil dikirim!
        </div>
      )}

      <div className="relative z-10 flex-1 p-4 md:p-8 pt-6 md:pt-10 flex flex-col">
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-7">

          {/* Header */}
          <header className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{ background: "#1B4332" }} />
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-green-400/30 bg-[#1B4332] flex items-center justify-center shadow-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&auto=format" alt="Rockopi" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight flex items-center gap-2 justify-center" style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
                <Coffee className="text-green-400" size={28} /> Rockopi
              </h1>
              <p className="text-white/50 text-sm mt-1">Pilih menu favoritmu, santai, dan nikmati harimu.</p>
            </div>
            <Link to="/admin" className="text-xs text-white/20 hover:text-white/40 transition-colors">→ Panel Admin</Link>
          </header>

          {/* Name input */}
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <label className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                <UserCircle2 size={14} className="text-green-400" /> Siapa Nama Anda?
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi (Meja 4)"
                maxLength={25}
                className="w-full bg-white/5 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-green-400/60 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-md mx-auto w-full scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? "text-white border-green-400/40 shadow-lg"
                    : "bg-white/4 text-white/40 border-white/5 hover:bg-white/8"
                }`}
                style={activeCategory === cat ? { backgroundColor: "#1B4332" } : {}}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => {
              const qty = orderItems[item.id] || 0;
              return (
                <div key={item.id} className="bg-white/4 backdrop-blur-md border border-white/8 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:border-green-400/20 transition-all duration-300 group shadow-xl">
                  <div className="h-40 overflow-hidden bg-black/20 relative cursor-pointer" onClick={() => setPreviewImage(item.image_url)}>
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className="text-white font-bold text-sm leading-snug">{item.name}</h3>
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/6">
                      <span className="text-green-400 font-black text-sm">Rp {item.price.toLocaleString("id-ID")}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDecrease(item.id)} disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-all">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-white font-bold text-sm tabular-nums">{qty}</span>
                        <button onClick={() => handleIncrease(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-all"
                          style={{ backgroundColor: "#1B4332" }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-white/15 text-xs pb-6">Est. 2019 · Rockopi Café</div>
        </div>
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-5 left-0 right-0 px-4 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between p-3 pr-2 rounded-2xl shadow-2xl border border-green-400/20"
              style={{ background: "linear-gradient(135deg, #1B4332, #0f2318)" }}>
              <div className="flex items-center gap-3 ml-1">
                <div className="relative">
                  <ShoppingCart size={20} className="text-white" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{totalItems}</span>
                </div>
                <div>
                  <p className="text-green-300 text-[10px] font-bold">Total Harga</p>
                  <p className="text-white font-black text-sm">Rp {totalPrice.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="bg-green-400 text-black px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-green-300 active:scale-95 transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Pesan Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
