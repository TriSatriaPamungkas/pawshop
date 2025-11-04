import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useItemStore } from "../../../store/useItemStore";

export default function CartScreen() {
  const { colors } = useTheme();
  const { items, editItem } = useItemStore();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showModal, setShowModal] = useState(false);

  // Tambah item ke cart
  const handleAddToCart = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.stock <= (cart[id] || 0)) {
      Alert.alert("Stok Habis", `${item.name} sudah mencapai stok maksimal.`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // Kurangi stok di Supabase dan store lokal
  const reduceStock = async (id: string, qty: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const newStock = Math.max(target.stock - qty, 0);
    console.log("Update stok:", target.name, "=>", newStock, " | ID:", id);

    try {
      const { data, error } = await supabase
        .from("items")
        .update({ stock: newStock })
        .eq("id", id)
        .select();

      console.log("Update result:", { data, error });

      if (error) throw error;

      editItem(id, { stock: newStock });
    } catch (err: any) {
      console.error("Error update stok:", err.message);
      Toast.show({
        type: "error",
        text1: "Gagal update stok",
        text2: err.message,
      });
    }
  };

  // Proses pembelian
  const handleBuy = async () => {
    try {
      // ambil data real-time dari cart
      const selectedItems = Object.entries(cart)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = items.find((i) => i.id === id);
          return item ? { ...item, qty } : null;
        })
        .filter(Boolean) as any[];

      if (selectedItems.length === 0) {
        Toast.show({
          type: "info",
          text1: "Keranjang kosong",
          text2: "Pilih item dulu sebelum membeli.",
        });
        return;
      }

      console.log(
        "🛒 Beli item:",
        selectedItems.map((i) => i.name)
      );

      await Promise.all(
        selectedItems.map((item) => reduceStock(item.id, item.qty))
      );

      setShowModal(false);
      setCart({});
      Toast.show({ type: "success", text1: "Transaksi berhasil!" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Transaksi gagal",
        text2: err.message,
      });
    }
  };

  const renderItem = ({ item }: any) => {
    const qty = cart[item.id] || 0;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.qtyText, { color: colors.text }]}>
            {qty > 0 ? `Dipilih: ${qty}` : "Belum dipilih"}
          </Text>
        </View>

        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAddToCart(item.id)}
        >
          <Text style={[styles.addText, { color: colors.background }]}>
            + Add
          </Text>
        </Pressable>
      </View>
    );
  };

  // Total harga realtime
  const totalHarga = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return item ? sum + item.harga * qty : sum;
  }, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Pawpay</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", color: colors.text, marginTop: 20 }}
          >
            Belum ada item tersedia.
          </Text>
        }
      />

      {Object.keys(cart).length > 0 && (
        <Pressable
          style={[styles.cartButton, { backgroundColor: "#28a745" }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="cart" size={26} color={colors.background} />
        </Pressable>
      )}

      {/* MODAL PEMBELIAN */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowModal(false);
          setCart({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              🧾 RINCIAN PEMBELIAN
            </Text>

            {/* Daftar item */}
            <View
              style={[styles.tableHeader, { borderBottomColor: colors.border }]}
            >
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 2, color: colors.text },
                ]}
              >
                Nama
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 1, textAlign: "center", color: colors.text },
                ]}
              >
                Qty
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 2, textAlign: "right", color: colors.text },
                ]}
              >
                Total
              </Text>
            </View>

            <View style={{ width: "100%", marginTop: 6, marginBottom: 8 }}>
              {Object.entries(cart)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const item = items.find((i) => i.id === id);
                  if (!item) return null;
                  const subtotal = item.harga * qty;

                  return (
                    <View
                      key={id}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 2, color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 1, color: colors.text },
                        ]}
                      >
                        {qty}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 1, textAlign: "right", color: colors.text },
                        ]}
                      >
                        Rp {subtotal.toLocaleString("id-ID")}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* Total keseluruhan */}
            <View
              style={[
                styles.totalRow,
                {
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                  paddingTop: 10,
                },
              ]}
            >
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total Keseluruhan:
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  { color: "#28a745", fontWeight: "700" },
                ]}
              >
                Rp {totalHarga.toLocaleString("id-ID")}
              </Text>
            </View>

            {/* Tombol aksi */}
            <Pressable
              style={[styles.buyButton, { backgroundColor: "#007bff" }]}
              onPress={handleBuy}
            >
              <Text style={[styles.buyText, { color: "#fff" }]}>
                Beli Sekarang
              </Text>
            </Pressable>

            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
                setCart({});
              }}
            >
              <Text style={[styles.closeText, { color: "#007bff" }]}>
                Tutup
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// === STYLING ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  qtyText: { fontSize: 13, marginTop: 4 },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addText: { fontWeight: "bold" },
  cartButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderRadius: 16,
    width: "85%",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    width: "100%",
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontWeight: "600" },
  totalValue: { fontSize: 15 },
  buyButton: {
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buyText: { fontWeight: "bold" },
  closeButton: { marginTop: 10 },
  closeText: { fontWeight: "600" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 4,
    width: "100%",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  tableCell: {
    fontSize: 14,
  },
});
