import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Komponen halaman login untuk autentikasi user
 * Menangani proses login dengan validasi dan feedback visual
 */
export default function LoginScreen() {
  // STATE MANAGEMENT
  const [username, setUsername] = useState(""); // State untuk menyimpan input username
  const [password, setPassword] = useState(""); // State untuk menyimpan input password
  const [loading, setLoading] = useState(false); // State untuk menandai proses loading login

  // HOOKS & STORE
  const { login } = useAuthStore(); // Fungsi login dari auth store (Zustand)
  const router = useRouter(); // Router untuk navigasi setelah login berhasil
  const { colors } = useTheme(); // Theme colors untuk styling yang responsive

  /**
   * Fungsi untuk menangani proses login user
   * - Validasi input tidak boleh kosong
   * - Menampilkan loading state selama proses
   * - Memberikan feedback sukses/gagal melalui toast
   * - Redirect ke halaman admin jika berhasil
   */
  const handleLogin = async () => {
    // Validasi: cek apakah username dan password sudah diisi
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "info",
        text1: "Lengkapi Data",
        text2: "Isi username dan password dulu ya.",
      });
      return;
    }

    // Memulai proses login
    setLoading(true);
    const success = await login(username.trim(), password.trim());
    setLoading(false);

    // Handle hasil login
    if (success) {
      Toast.show({
        type: "success",
        text1: "Login Berhasil 🎉",
        text2: `Selamat datang, ${username}!`,
      });
      // Redirect ke halaman admin setelah delay 800ms
      setTimeout(() => router.replace("/(admin)"), 800);
    } else {
      Toast.show({
        type: "error",
        text1: "Login Gagal",
        text2: "Username atau password salah!",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER TITLE */}
      <Text style={[styles.title, { color: colors.text }]}>My PawShop</Text>

      {/* INPUT FIELD USERNAME */}
      <TextInput
        placeholder="Username"
        placeholderTextColor={colors.text + "88"} // Tambah transparency 88 hex
        value={username}
        onChangeText={setUsername} // Update state username on change
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      />

      {/* INPUT FIELD PASSWORD */}
      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.text + "88"}
        secureTextEntry // Menyembunyikan karakter password
        value={password}
        onChangeText={setPassword} // Update state password on change
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      />

      {/* LOGIN BUTTON */}
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: loading ? "#aaa" : colors.primary, // Ubah warna saat loading
          },
        ]}
        onPress={handleLogin} // Trigger login function
        disabled={loading} // Non-aktifkan button saat loading
      >
        {loading ? (
          // Tampilkan loading indicator selama proses login
          <ActivityIndicator color="#fff" />
        ) : (
          // Tampilkan teks login normal
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Stylesheet untuk komponen LoginScreen
 * Menggunakan StyleSheet.create untuk optimasi performance
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Vertikal center
    alignItems: "center", // Horizontal center
    padding: 20, // Padding around content
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40, // Spasi bawah yang cukup besar
  },
  input: {
    width: "100%", // Full width container
    borderWidth: 1,
    borderRadius: 10, // Rounded corners
    padding: 12, // Internal padding
    marginBottom: 20, // Spasi antar input
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10, // Rounded button
  },
  buttonText: {
    color: "#fff", // White text color
    fontWeight: "bold",
    fontSize: 16,
  },
});
