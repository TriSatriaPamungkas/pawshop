import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      {/* ✅ PERUBAHAN: Semua tab sekarang reference ke (tabs) group */}
      <Tabs.Screen
        name="(tabs)/index" // 🟡 BERUBAH: dari "index" jadi "(tabs)/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tabs)/cart" // 🟡 BERUBAH: dari "cart" jadi "(tabs)/cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tabs)/profile" // 🟡 BERUBAH: dari "profile" jadi "(tabs)/profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* HIDE yang tidak perlu */}
      <Tabs.Screen name="add-item.modal" options={{ href: null }} />
      <Tabs.Screen name="detail/[id]" options={{ href: null }} />
    </Tabs>
  );
}
