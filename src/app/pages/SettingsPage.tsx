import { useState } from "react";
import { Settings, Lock, Palette, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";

const THEME_OPTIONS = [
  { label: "Forest Green", value: "#1B4332", accent: "#22c55e" },
  { label: "Ocean Blue", value: "#1e3a5f", accent: "#3b82f6" },
  { label: "Royal Purple", value: "#3b1f5e", accent: "#a855f7" },
  { label: "Sunset Orange", value: "#5e2b1f", accent: "#f97316" },
  { label: "Rose Gold", value: "#5e1f3b", accent: "#f43f5e" },
  { label: "Midnight Slate", value: "#1f2937", accent: "#6b7280" },
];

export function SettingsPage() {
  const { pin, changePin, themeColor, setThemeColor } = useApp();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin !== pin) { setPinMessage({ type: "error", text: "PIN saat ini salah!" }); return; }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) { setPinMessage({ type: "error", text: "PIN baru harus 6 digit angka!" }); return; }
    if (newPin !== confirmPin) { setPinMessage({ type: "error", text: "Konfirmasi PIN tidak cocok!" }); return; }
    setIsSavingPin(true);
    await new Promise(r => setTimeout(r, 500));
    changePin(newPin);
    setCurrentPin(""); setNewPin(""); setConfirmPin("");
    setPinMessage({ type: "success", text: "PIN berhasil diubah!" });
    setIsSavingPin(false);
    setTimeout(() => setPinMessage(null), 3000);
  };

  return (
    <div className="min-h-full p-4 md:p-7 flex flex-col gap-6" style={{ backgroundColor: "#07110a" }}>
      {/* Header */}
      <header>
        <h2 className="text-white font-black text-xl md:text-2xl flex items-center gap-3">
          <Settings size={22} className="text-green-400" /> Pengaturan Sistem
        </h2>
        <p className="text-white/30 text-xs mt-1">Konfigurasi panel admin Rockopi</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIN Management */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 bg-black/20 flex items-center gap-3">
            <Shield size={18} className="text-green-400" />
            <div>
              <h3 className="text-white font-bold text-sm">Keamanan PIN</h3>
              <p className="text-white/30 text-xs">Ubah PIN 6 digit untuk akses panel admin</p>
            </div>
          </div>
          <div className="p-6">
            {pinMessage && (
              <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border ${
                pinMessage.type === "success" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-red-400/10 text-red-400 border-red-400/20"
              }`}>
                {pinMessage.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {pinMessage.text}
              </div>
            )}
            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">PIN Saat Ini</label>
                <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value.slice(0, 6))}
                  placeholder="Masukkan PIN saat ini"
                  className="w-full bg-white/4 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-green-400/40 outline-none text-sm transition-all tracking-widest" maxLength={6} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">PIN Baru</label>
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/, "").slice(0, 6))}
                  placeholder="6 digit angka baru"
                  className="w-full bg-white/4 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-green-400/40 outline-none text-sm transition-all tracking-widest" maxLength={6} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Konfirmasi PIN Baru</label>
                <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/, "").slice(0, 6))}
                  placeholder="Ulangi PIN baru"
                  className="w-full bg-white/4 text-white placeholder-white/20 px-4 py-3 rounded-xl border border-white/8 focus:border-green-400/40 outline-none text-sm transition-all tracking-widest" maxLength={6} />
              </div>
              <button type="submit" disabled={isSavingPin}
                className="w-full py-3 font-bold text-white rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#1B4332" }}>
                {isSavingPin ? "Menyimpan..." : "Ubah PIN"}
              </button>
            </form>
            <p className="text-white/20 text-[10px] mt-4 text-center">PIN default: 123456</p>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 bg-black/20 flex items-center gap-3">
            <Palette size={18} className="text-green-400" />
            <div>
              <h3 className="text-white font-bold text-sm">Tema Warna Panel</h3>
              <p className="text-white/30 text-xs">Pilih warna tema untuk sidebar dan aksen UI</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map(theme => {
                const isActive = themeColor === theme.value;
                return (
                  <button key={theme.value} onClick={() => setThemeColor(theme.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isActive ? "border-white/30 bg-white/8" : "border-white/6 bg-white/2 hover:bg-white/5"
                    }`}>
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: theme.value }} />
                      <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: theme.accent }} />
                    </div>
                    <span className={`text-xs font-bold ${isActive ? "text-white" : "text-white/40"}`}>{theme.label}</span>
                    {isActive && <CheckCircle size={14} className="ml-auto text-green-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* System info */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-white/8 bg-black/20 flex items-center gap-3">
            <Lock size={18} className="text-green-400" />
            <h3 className="text-white font-bold text-sm">Informasi Sistem</h3>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Versi Sistem", value: "v2.0.0" },
              { label: "Auto-lock", value: "5 Menit" },
              { label: "Database", value: "Supabase" },
              { label: "Status", value: "● Aktif" },
            ].map(item => (
              <div key={item.label} className="bg-white/2 border border-white/5 rounded-xl p-4">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-white font-bold text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
