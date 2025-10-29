import { IMAGES } from "@/constants/images"; // pastiin IMAGES.cat ada di sini
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useItemStore } from "../../../store/useItemStore";

export default function DetailItem() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { items, editItem } = useItemStore();

  const currentItem = items.find((i) => i.id === id);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [kategori, setKategori] = useState("");
  const [harga, setHarga] = useState("");
  const [status, setStatus] = useState("Ready");
  const { colors } = useTheme();

  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name?.toString() || "");
      setStock(currentItem.stock?.toString() || "");
      setKategori(currentItem.kategori || "");
      setHarga(currentItem.harga?.toString() || "");

      // logic status
      setStatus(currentItem.stock > 0 ? "Ready" : "Sold Out");
    }
  }, [currentItem]);

  // Auto update status kalau stok berubah
  useEffect(() => {
    const qty = parseInt(stock);
    if (!isNaN(qty)) setStatus(qty > 0 ? "Ready" : "Sold Out");
  }, [stock]);

  const handleSave = async () => {
    if (!name || !stock || !kategori || !harga) {
      Toast.show({ type: "error", text1: "Semua field wajib diisi!" });
      return;
    }

    const qty = parseInt(stock);
    const newStatus = qty > 0 ? "Ready" : "Sold Out";

    try {
      //Update Supabase
      const { error } = await supabase
        .from("items")
        .update({
          name,
          stock: qty,
          kategori,
          harga: parseInt(harga),
        })
        .eq("id", id);

      if (error) throw error;

      //  Update Zustand
      editItem(id as string, {
        name,
        stock: qty,
        kategori,
        harga: parseInt(harga),
      });

      setStatus(newStatus);
      Toast.show({ type: "success", text1: "Item berhasil diperbarui!" });

      // ✅ Balik ke home
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Gagal update item",
        text2: err.message,
      });
    }
  };

  if (!currentItem) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Item tidak ditemukan 🐾</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </Pressable>

        <View style={styles.imageWrapper}>
          <Image
            source={
              kategori?.toLowerCase() === "kucing" ? IMAGES.cat : IMAGES.dog
            }
            style={styles.image}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Edit Item</Text>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons name="pricetag-outline" size={20} color={colors.text} />
          <TextInput
            placeholder="Nama Item"
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: colors.text }]}
            editable={false}
          />
        </View>
        {/* Stok */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons name="cube-outline" size={20} color={colors.text} />
          <TextInput
            placeholder="Stok"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        {/* Harga */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons name="cash-outline" size={20} color={colors.text} />
          <TextInput
            placeholder="Harga"
            value={harga}
            onChangeText={setHarga}
            keyboardType="numeric"
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        {/* Kategori */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons name="list-outline" size={20} color={colors.text} />
          <TextInput
            placeholder="Kategori (Kucing / Anjing)"
            value={kategori}
            onChangeText={setKategori}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        {/* 🔁 Status tampil otomatis */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status === "Ready" ? "#4CAF50" : "#999" },
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Simpan Perubahan</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
  imageWrapper: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  statusBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: { color: "#fff", fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontSize: 18,
    color: "#999",
    fontWeight: "600",
  },
});
