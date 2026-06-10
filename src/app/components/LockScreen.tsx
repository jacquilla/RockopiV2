import { useState } from "react";
import { Lock, Delete } from "lucide-react";
import { useApp } from "../context/AppContext";

export function LockScreen() {
  const { unlock, wrongPinCount } = useApp();
  const [pin, setPin] = useState("");

  const handleKey = (key: string) => {
    if (pin.length < 6) {
      const next = pin + key;
      setPin(next);
      if (next.length === 6) {
        setTimeout(() => {
          const ok = unlock(next);
          if (!ok) setPin("");
        }, 120);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#07110a]"
      style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(27,67,50,0.4) 0%, transparent 70%)" }}>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
            <Lock size={28} className="text-green-400" />
          </div>
          <h1 className="text-white font-bold tracking-wide text-xl">Masukkan PIN</h1>
          <p className="text-sm text-white/40 text-center">Akses terkunci. Masukkan PIN 6 digit untuk melanjutkan.</p>
        </div>

        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length ? "bg-green-400 border-green-400 scale-110" : "bg-transparent border-white/20"
            }`} />
          ))}
        </div>

        {wrongPinCount > 0 && (
          <p className="text-red-400 text-xs animate-pulse -mt-4">PIN salah! Percobaan ke-{wrongPinCount}</p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full">
          {["1","2","3","4","5","6","7","8","9"].map(k => (
            <button key={k} onClick={() => handleKey(k)}
              className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white text-xl font-bold hover:bg-white/10 active:scale-95 transition-all">
              {k}
            </button>
          ))}
          <div />
          <button onClick={() => handleKey("0")}
            className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white text-xl font-bold hover:bg-white/10 active:scale-95 transition-all">
            0
          </button>
          <button onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white/60 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center">
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
