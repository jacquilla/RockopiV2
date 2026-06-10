import { useState } from "react";
import { Store, Edit3, Save, X, RefreshCw, Search, Package } from "lucide-react";
import { useApp, type Category } from "../context/AppContext";

const CATEGORY_COLORS: Record<Category, string> = {
  "Hot Coffee": "bg-orange-400/10 text-orange-400 border-orange-400/20",
  "Iced Coffee": "bg-blue-400/10 text-blue-400 border-blue-400/20",
  "Non Coffee": "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

export function ProductsPage() {
  const { products, updateProduct } = useApp();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (id: number, desc: string) => { setEditingId(id); setEditDesc(desc); };

  const handleSave = async (id: number) => {
    if (!editDesc.trim()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateProduct(id, editDesc.trim());
    setEditingId(null);
    setIsSaving(false);
  };

  return (
    <div className="min-h-full p-4 md:p-7 flex flex-col gap-6" style={{ backgroundColor: "#07110a" }}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <Store size={22} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl">Master Produk Rockopi</h2>
            <p className="text-white/30 text-xs mt-0.5">{products.length} produk tersedia di 3 kategori</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(v => v === "table" ? "grid" : "table")}
            className="p-2.5 bg-white/4 border border-white/8 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all">
            {viewMode === "table" ? <Package size={16} /> : <Store size={16} />}
          </button>
          <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-white/60 hover:text-white hover:bg-white/8 text-xs font-bold transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Cari produk atau kategori..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white/4 text-white placeholder-white/20 pl-11 pr-4 py-3 rounded-xl border border-white/8 focus:border-green-400/40 outline-none text-sm transition-all"
        />
      </div>

      {/* Table view */}
      {viewMode === "table" ? (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-white/8 bg-black/20">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                  <th className="px-5 py-4 w-32">Kategori</th>
                  <th className="px-5 py-4 w-48">Nama Menu</th>
                  <th className="px-5 py-4 w-32">Harga</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${CATEGORY_COLORS[p.category]}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover opacity-80" />
                        <span className="text-white font-bold text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-green-400 font-black text-sm">Rp {p.price.toLocaleString("id-ID")}</span>
                    </td>
                    <td className="px-5 py-4">
                      {editingId === p.id ? (
                        <textarea
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          className="w-full bg-white/5 text-white px-3 py-2 rounded-xl border border-green-400/30 outline-none text-xs resize-none"
                          rows={3}
                        />
                      ) : (
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{p.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {editingId === p.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleSave(p.id)} disabled={isSaving}
                            className="p-2 bg-green-500 hover:bg-green-400 rounded-lg text-white transition-all disabled:opacity-50">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-2 bg-white/8 hover:bg-white/15 rounded-lg text-white/60 transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p.id, p.description)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-white/50 hover:text-white text-xs font-bold flex items-center gap-1.5 mx-auto transition-all">
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all group">
              <div className="h-32 overflow-hidden relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${CATEGORY_COLORS[p.category]}`}>{p.category}</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">{p.name}</h3>
                  <span className="text-green-400 font-black text-xs">Rp {p.price.toLocaleString("id-ID")}</span>
                </div>
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      className="w-full bg-white/5 text-white px-3 py-2 rounded-xl border border-green-400/30 outline-none text-xs resize-none" rows={3} />
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(p.id)} disabled={isSaving}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-400 rounded-lg text-white text-xs font-bold transition-all disabled:opacity-50">
                        Simpan
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2">{p.description}</p>
                    <button onClick={() => startEdit(p.id, p.description)}
                      className="w-full py-2 mt-1 bg-white/4 hover:bg-white/8 border border-white/6 rounded-lg text-white/40 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                      <Edit3 size={12} /> Edit Deskripsi
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
