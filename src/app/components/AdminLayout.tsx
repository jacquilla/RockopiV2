import { NavLink, Outlet } from "react-router";
import { LayoutDashboard, Package, History, BookOpen, Settings, Lock, Coffee } from "lucide-react";
import { useApp } from "../context/AppContext";
import { LockScreen } from "./LockScreen";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Master Produk", path: "/admin/products", icon: Package, end: false },
  { label: "Riwayat", path: "/admin/transactions", icon: History, end: false },
  { label: "Pembukuan", path: "/admin/finance", icon: BookOpen, end: false },
  { label: "Pengaturan", path: "/admin/settings", icon: Settings, end: false },
];

export function AdminLayout() {
  const { isLocked, lock, themeColor } = useApp();

  return (
    <>
      {isLocked && <LockScreen />}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden" style={{ backgroundColor: "#07110a" }}>

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-black/40 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor }}>
              <Coffee size={14} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm">Rockopi</span>
              <p className="text-[9px] font-bold tracking-widest" style={{ color: "#4ade80" }}>WAREHOUSE PANEL</p>
            </div>
          </div>
          <button onClick={lock} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <Lock size={16} />
          </button>
        </header>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 flex-col border-r border-white/5 shrink-0" style={{ backgroundColor: "#07110a" }}>
          <div className="px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: themeColor }}>
                <Coffee size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">Rockopi</p>
                <p className="text-[9px] font-bold tracking-[0.2em]" style={{ color: "#4ade80" }}>WAREHOUSE PANEL</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
              <NavLink key={path} to={path} end={end}>
                {({ isActive }) => (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive ? "text-white font-bold shadow-lg" : "text-white/40 hover:text-white/70 hover:bg-white/4"
                  }`} style={isActive ? { backgroundColor: themeColor } : {}}>
                    <Icon size={18} />
                    <span className="text-sm">{label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-white/5">
            <button onClick={lock} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all">
              <Lock size={18} />
              <span className="text-sm font-bold">Kunci Panel</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/8 flex">
          {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} className="flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center py-2 gap-1">
                  <div className={`p-2 rounded-xl transition-all ${isActive ? "text-white" : "text-white/30"}`}
                    style={isActive ? { backgroundColor: themeColor } : {}}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[9px] font-bold ${isActive ? "text-white" : "text-white/30"}`}>
                    {label === "Master Produk" ? "Produk" : label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
