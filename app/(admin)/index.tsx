import { IMAGES } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { supabase } from "../../lib/supabase";
import { Item, useItemStore } from "../../store/useItemStore";

export default function HomeScreen() {
  const router = useRouter();
  const { items, removeItem } = useItemStore();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { colors } = useTheme();
  const scheme = useColorScheme();

  const { setItems } = useItemStore(); // ✅ panggil di luar useEffect, biar React aman

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        const { data, error } = await supabase.from("items").select("*");
        if (!error && data) setItems(data);
      };

      fetchItems();
    }, [setItems])
  );

  // 🔥 Filter item by kategori
  const filteredItems =
    selectedCategory === "Semua"
      ? items
      : items.filter(
          (item) =>
            item.kategori?.toLowerCase() === selectedCategory.toLowerCase()
        );

  // 🔥 Hapus item dari Supabase juga
  const handleDelete = async (id: string) => {
    Alert.alert("Konfirmasi Hapus", "Yakin mau hapus item ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("items")
              .delete()
              .eq("id", id);
            if (error) throw error;

            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            removeItem(id);
            Toast.show({ type: "success", text1: "Item berhasil dihapus!" });
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Gagal hapus item",
              text2: err.message,
            });
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Item }) => {
    const imgSrc =
      item.kategori?.toLowerCase() === "kucing" ? IMAGES.cat : IMAGES.dog;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.push(`/(admin)/detail/${item.id}`)}
          style={styles.infoArea}
        >
          <Image source={imgSrc} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.category, { color: colors.text + "AA" }]}>
              Rp. {item.harga?.toLocaleString("id-ID")}
            </Text>
            <Text
              style={{
                fontWeight: "bold",
                color: item.stock > 0 ? "#4CAF50" : "#FF3B30",
              }}
            >
              {item.stock > 0 ? `Stock: ${item.stock}` : "Sold Out"}
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: "#FF3B30" }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, padding: 20 },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.text }]}>List Item</Text>

        {/* Dropdown trigger */}
        <View>
          <Pressable
            style={[
              styles.dropdownTrigger,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {selectedCategory}
            </Text>
            <Ionicons
              name={dropdownVisible ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.text}
            />
          </Pressable>

          {dropdownVisible && (
            <View
              style={[
                styles.dropdownMenu,
                { backgroundColor: colors.card, shadowColor: colors.border },
              ]}
            >
              {["Semua", "Kucing", "Anjing"].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setDropdownVisible(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === cat && {
                      backgroundColor: scheme === "dark" ? "#333" : "#f0f8ff",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat ? "#007bff" : colors.text,
                      fontWeight: selectedCategory === cat ? "bold" : "normal",
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: colors.text }}
          >
            Belum ada item, tambahin dulu ya
          </Text>
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Tombol tambah */}
      <Pressable
        style={[styles.addButton, { backgroundColor: "#007bff" }]}
        onPress={() => router.push("/(admin)/add-item.modal")}
      >
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 14,
    marginRight: 5,
  },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    borderRadius: 8,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: 130,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoArea: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  info: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  category: { fontSize: 14, marginBottom: 4 },
  deleteButton: {
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
    elevation: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  addText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
});
