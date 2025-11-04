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

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "info",
        text1: "Lengkapi Data",
        text2: "Isi username dan password dulu ya.",
      });
      return;
    }

    setLoading(true);
    const success = await login(username.trim(), password.trim());
    setLoading(false);

    if (success) {
      Toast.show({
        type: "success",
        text1: "Login Berhasil 🎉",
        text2: `Selamat datang, ${username}!`,
      });
      setTimeout(() => router.replace("/(admin)"), 800);
    } else {
      Toast.show({
        type: "error",
        text1: "Login Gagal ❌",
        text2: "Username atau password salah!",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>My PawShop</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor={colors.text + "88"}
        value={username}
        onChangeText={setUsername}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.text + "88"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      />

      <Pressable
        style={[
          styles.button,
          { backgroundColor: loading ? "#aaa" : colors.primary },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
