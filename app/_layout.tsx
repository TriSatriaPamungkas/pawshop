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
import { useThemeStore } from "../store/useThemeStore";

// Root layout dengan auth guard dan theme management
export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Tunggu Zustand persist selesai hydration
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });
    return () => unsub();
  }, []);

  // Redirect berdasarkan status login setelah hydration
  useEffect(() => {
    if (!isReady) return;
    router.replace(isLoggedIn ? "/(admin)" : "/(auth)/login");
  }, [isReady, isLoggedIn, router]);

  return (
    <RootSiblingParent>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        {/* Stack navigator dengan konfigurasi per group */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(auth)"
            options={{
              animation: "fade",
              gestureEnabled: false, // Prevent swipe back di auth flow
            }}
          />
          <Stack.Screen
            name="(admin)"
            options={{
              animation: "slide_from_bottom",
              gestureEnabled: true, // Allow swipe back di admin area
            }}
          />
        </Stack>
        <Toast />
      </ThemeProvider>
    </RootSiblingParent>
  );
}
