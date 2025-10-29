import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddItemModal() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("");
  const router = useRouter();
  const { colors } = useTheme(); // ambil warna dari theme aktif

  const handleAdd = async () => {
    if (!name || !stock || !harga || !kategori) {
      Toast.show({ type: "error", text1: "Isi semua field dulu ya!" });
      return;
    }

    const newItem = {
      name,
      stock: parseInt(stock),
      harga: parseInt(harga),
      kategori,
      created_at: new Date().toISOString(),
    };

    // Simpan ke Supabase
    const { data, error } = await supabase.from("items").insert([newItem]);

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      Toast.show({ type: "error", text1: "Gagal nyimpen ke Supabase!" });
      return;
    }

    console.log("✅ Data tersimpan:", data);
    await fetchItems();
    Toast.show({ type: "success", text1: "Item berhasil ditambahkan!" });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>PawAdd</Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {/* Nama */}
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
                placeholderTextColor={colors.text + "88"}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: colors.text }]}
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
                placeholderTextColor={colors.text + "88"}
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
                placeholderTextColor={colors.text + "88"}
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
                placeholderTextColor={colors.text + "88"}
                value={kategori}
                onChangeText={setKategori}
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.buttonText}>Simpan</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
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
    paddingVertical: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
function fetchItems() {
  throw new Error("Function not implemented.");
}
