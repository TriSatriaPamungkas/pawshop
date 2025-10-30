import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore"; // 🧩 Tambahan

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();
  const { theme } = useThemeStore(); // 🧩 ambil state dari Zustand theme
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // nunggu Zustand persist kelar
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isReady) return; // tahan navigasi dulu
    if (!isLoggedIn) router.replace("/(auth)/login");
    else router.replace("/(admin)");
  }, [isReady, isLoggedIn, router]);

  return (
    <RootSiblingParent>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(admin)" />
        </Stack>
        <Toast />
      </ThemeProvider>
    </RootSiblingParent>
  );
}
