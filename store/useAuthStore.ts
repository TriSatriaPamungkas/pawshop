import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      // 🔐 LOGIN ke Supabase
      login: async (username, password) => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .single();

          if (error || !data) {
            console.warn("Login gagal:", error?.message);
            return false;
          }

          set({ user: data, isLoggedIn: true });
          return true;
        } catch (err) {
          console.error("Login error:", err);
          return false;
        }
      },

      // 🚪 LOGOUT
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },

      // 🔁 Restore dari storage (buat auto-login)
      restoreSession: async () => {
        const stored = get().user;
        if (stored) set({ isLoggedIn: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
