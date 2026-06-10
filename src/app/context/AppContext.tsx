import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

export type Category = "Hot Coffee" | "Iced Coffee" | "Non Coffee";
export type OrderStatus = "PENDING" | "PAID";
export type ProductionStatus = "PENDING" | "DONE";
export type TransactionType = "IN" | "OUT";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
}

export interface Order {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  status: OrderStatus;
  production_status: ProductionStatus;
  created_at: string;
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  isLocked: boolean;
  pin: string;
  themeColor: string;
  wrongPinCount: number;
  lock: () => void;
  unlock: (enteredPin: string) => boolean;
  changePin: (newPin: string) => void;
  updateProduct: (id: number, description: string) => void;
  addOrder: (order: Omit<Order, "id" | "created_at" | "status" | "production_status">) => void;
  updateOrderStatus: (id: number, field: "status" | "production_status", value: string) => void;
  deleteOrder: (id: number) => void;
  addExpense: (description: string, amount: number) => void;
  setThemeColor: (color: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Espresso", description: "Kopi hitam pekat dengan crema sempurna, ekstrak biji kopi pilihan Rockopi dengan teknik double shot.", price: 22000, category: "Hot Coffee", image_url: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop&auto=format" },
  { id: 2, name: "Americano", description: "Espresso yang diencerkan dengan air panas, rasa kopi yang kuat namun lebih ringan dari espresso murni.", price: 25000, category: "Hot Coffee", image_url: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400&h=300&fit=crop&auto=format" },
  { id: 3, name: "Cappuccino", description: "Perpaduan sempurna espresso, susu kukus, dan busa susu lembut. Klasik Italia yang tak tergantikan.", price: 28000, category: "Hot Coffee", image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format" },
  { id: 4, name: "Caramel Latte", description: "Latte manis dengan siraman saus karamel premium, perpaduan espresso dan susu yang harmonis.", price: 32000, category: "Hot Coffee", image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&auto=format" },
  { id: 5, name: "Iced Americano", description: "Espresso segar yang disajikan dingin dengan es batu, cocok untuk hari yang panas.", price: 27000, category: "Iced Coffee", image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop&auto=format" },
  { id: 6, name: "Iced Latte", description: "Latte dingin dengan susu segar, hadir dalam pilihan rasa original dan brown sugar.", price: 32000, category: "Iced Coffee", image_url: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=300&fit=crop&auto=format" },
  { id: 7, name: "Matcha Latte", description: "Matcha grade premium Jepang dengan susu segar, perpaduan rasa pahit manis yang memanjakan.", price: 35000, category: "Iced Coffee", image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop&auto=format" },
  { id: 8, name: "Brown Sugar Boba", description: "Teh susu dengan gula aren dan boba kenyal di dalamnya. Hits dan instagramable!", price: 38000, category: "Iced Coffee", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format" },
  { id: 9, name: "Coklat Panas", description: "Minuman coklat mewah berbahan dark chocolate Belgium, creamy dan menghangatkan tubuh.", price: 28000, category: "Non Coffee", image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop&auto=format" },
  { id: 10, name: "Teh Tarik", description: "Teh susu khas yang ditarik berulang kali hingga berbusa, aroma teh wangi dengan susu pekat.", price: 20000, category: "Non Coffee", image_url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format" },
  { id: 11, name: "Strawberry Smoothie", description: "Smoothie stroberi segar dari buah lokal pilihan, dingin, manis, dan menyegarkan.", price: 30000, category: "Non Coffee", image_url: "https://images.unsplash.com/photo-1553530666-ba11a90a3b1c?w=400&h=300&fit=crop&auto=format" },
  { id: 12, name: "Lemon Tea", description: "Teh hitam premium dengan perasan lemon segar, disajikan dingin dengan sedikit madu.", price: 22000, category: "Non Coffee", image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format" },
];

const now = () => new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const INITIAL_ORDERS: Order[] = [
  { id: 1, description: "A/N [BUDI SANTOSO - Meja 3] - 2x Espresso & 1x Cappuccino", amount: 78000, type: "IN", status: "PAID", production_status: "DONE", created_at: hoursAgo(5) },
  { id: 2, description: "A/N [SITI RAHAYU - Meja 7] - 1x Matcha Latte & 2x Brown Sugar Boba", amount: 111000, type: "IN", status: "PAID", production_status: "DONE", created_at: hoursAgo(4) },
  { id: 3, description: "A/N [REZA - Meja 1] - 3x Iced Americano", amount: 81000, type: "IN", status: "PAID", production_status: "DONE", created_at: hoursAgo(3) },
  { id: 4, description: "A/N [DIAN - Meja 5] - 1x Caramel Latte & 1x Teh Tarik", amount: 52000, type: "IN", status: "PAID", production_status: "DONE", created_at: hoursAgo(2) },
  { id: 5, description: "[PENGELUARAN] - Biji Kopi Arabika 5kg", amount: 450000, type: "OUT", status: "PAID", production_status: "DONE", created_at: hoursAgo(6) },
  { id: 6, description: "A/N [ANDI WIJAYA - Meja 2] - 2x Iced Latte & 1x Coklat Panas", amount: 92000, type: "IN", status: "PENDING", production_status: "DONE", created_at: minutesAgo(15) },
  { id: 7, description: "A/N [MAYA - Meja 4] - 1x Americano & 1x Strawberry Smoothie", amount: 55000, type: "IN", status: "PENDING", production_status: "PENDING", created_at: minutesAgo(8) },
  { id: 8, description: "A/N [TOMMY - Meja 6] - 2x Brown Sugar Boba", amount: 76000, type: "IN", status: "PENDING", production_status: "PENDING", created_at: minutesAgo(3) },
];

let nextOrderId = 9;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("123456");
  const [themeColor, setThemeColor] = useState("#1B4332");
  const [wrongPinCount, setWrongPinCount] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetActivity));
    lockTimerRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) {
        setIsLocked(true);
      }
    }, 30000);
    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [resetActivity]);

  const lock = useCallback(() => setIsLocked(true), []);

  const unlock = useCallback((enteredPin: string): boolean => {
    if (enteredPin === pin) {
      setIsLocked(false);
      setWrongPinCount(0);
      lastActivityRef.current = Date.now();
      return true;
    }
    setWrongPinCount(c => c + 1);
    return false;
  }, [pin]);

  const changePin = useCallback((newPin: string) => setPin(newPin), []);

  const updateProduct = useCallback((id: number, description: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, description } : p));
  }, []);

  const addOrder = useCallback((order: Omit<Order, "id" | "created_at" | "status" | "production_status">) => {
    const newOrder: Order = {
      ...order,
      id: nextOrderId++,
      status: "PENDING",
      production_status: "PENDING",
      created_at: now(),
    };
    setOrders(prev => [...prev, newOrder]);
  }, []);

  const updateOrderStatus = useCallback((id: number, field: "status" | "production_status", value: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  }, []);

  const deleteOrder = useCallback((id: number) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const addExpense = useCallback((description: string, amount: number) => {
    const newOrder: Order = {
      id: nextOrderId++,
      description: `[PENGELUARAN] - ${description}`,
      amount,
      type: "OUT",
      status: "PAID",
      production_status: "DONE",
      created_at: now(),
    };
    setOrders(prev => [...prev, newOrder]);
  }, []);

  return (
    <AppContext.Provider value={{
      products, orders, isLocked, pin, themeColor, wrongPinCount,
      lock, unlock, changePin, updateProduct,
      addOrder, updateOrderStatus, deleteOrder, addExpense, setThemeColor,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
