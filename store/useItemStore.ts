import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase"; // pastiin path-nya sesuai

// ===== TYPE DEFINITIONS =====
export type Item = {
  id: string;
  name: string;
  stock: number;
  kategori: string;
  harga: number;
};

export type TransactionItem = Item & { quantity: number };

export type Transaction = {
  id: string;
  items: TransactionItem[];
  total: number;
  date: string;
};

// ===== STORE TYPE =====
type StoreState = {
  [x: string]: any;
  items: Item[];
  cart: TransactionItem[];
  transactions: Transaction[];

  fetchItems: () => Promise<void>;
  addItem: (item: Item) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  editItem: (id: string, updated: Partial<Item>) => Promise<void>;

  addToCart: (item: Item) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  checkoutTransaction: () => void;
  restoreStock: (transactionId: string) => void;
};

// ===== STORE IMPLEMENTATION =====
export const useItemStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      cart: [],
      transactions: [],

      // ✅ Fetch dari Supabase
      fetchItems: async () => {
        const { data, error } = await supabase.from("items").select("*");
        if (error) console.error("Error fetch:", error.message);
        else set({ items: data });
      },

      setItems: (items: Item[]) => set({ items }),

      // ✅ Tambah Item ke Supabase + State
      addItem: async (item) => {
        const { error } = await supabase.from("items").insert(item);
        if (error) console.error("Error insert:", error.message);
        else set((state) => ({ items: [...state.items, item] }));
      },

      // ✅ Hapus Item
      removeItem: async (id) => {
        const { error } = await supabase.from("items").delete().eq("id", id);
        if (error) console.error("Error delete:", error.message);
        else
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
      },

      // ✅ Edit Item
      editItem: async (id, updated) => {
        const { error } = await supabase
          .from("items")
          .update(updated)
          .eq("id", id);
        if (error) console.error("Error update:", error.message);
        else
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updated } : item
            ),
          }));
      },

      // ✅ CART LOGIC
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          const original = state.items.find((i) => i.id === item.id);

          if (!original || original.stock <= 0) return state;

          if (existing) {
            const newQty =
              existing.quantity + 1 > original.stock
                ? existing.quantity
                : existing.quantity + 1;

            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i
              ),
            };
          }

          return {
            cart: [...state.cart, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ cart: [] }),

      // ✅ CHECKOUT TRANSACTION
      checkoutTransaction: () => {
        const { cart, items } = get();
        if (cart.length === 0) return;

        const total = cart.reduce(
          (sum, item) => sum + item.harga * item.quantity,
          0
        );

        const transaction: Transaction = {
          id: Date.now().toString(),
          items: cart,
          total,
          date: new Date().toISOString(),
        };

        const updatedItems = items.map((item) => {
          const purchased = cart.find((c) => c.id === item.id);
          return purchased
            ? {
                ...item,
                stock: Math.max(item.stock - purchased.quantity, 0),
                bought: true,
              }
            : item;
        });

        set((state) => ({
          items: updatedItems,
          transactions: [...state.transactions, transaction],
          cart: [],
        }));
      },

      // ✅ RESTORE STOK
      restoreStock: (transactionId) =>
        set((state) => {
          const transaction = state.transactions.find(
            (t) => t.id === transactionId
          );
          if (!transaction) return state;

          const restoredItems = state.items.map((item) => {
            const purchased = transaction.items.find((i) => i.id === item.id);
            return purchased
              ? { ...item, stock: item.stock + purchased.quantity }
              : item;
          });

          return {
            items: restoredItems,
            transactions: state.transactions.filter(
              (t) => t.id !== transactionId
            ),
          };
        }),
    }),
    {
      name: "pawshop-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
