import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "../../../store/useAuthStore";
import { useThemeStore } from "../../../store/useThemeStore";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { theme, toggleTheme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header dengan gradient effect */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Paw Profile</Text>
        <View style={styles.switchContainer}>
          <Text style={[styles.themeLabel, { color: colors.text }]}>
            {isDark ? "🌙" : "☀️"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#d1d5db", true: "#10b981" }}
            thumbColor={isDark ? "#f3f4f6" : "#ffffff"}
            ios_backgroundColor="#d1d5db"
          />
        </View>
      </View>

      {/* Card Profile dengan shadow lebih halus */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#1f2937",
          },
        ]}
      >
        {/* Avatar dengan border gradient effect */}
        <View
          style={[
            styles.avatarContainer,
            { borderColor: isDark ? "#10b981" : "#3b82f6" },
          ]}
        >
          <Image
            source={require("../../../assets/images/profile.png")}
            style={styles.avatar}
          />
        </View>

        {/* Role Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: isDark ? "#065f46" : "#dbeafe" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isDark ? "#10b981" : "#1e40af" },
            ]}
          >
            Admin
          </Text>
        </View>

        {/* Username Input dengan icon */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: isDark ? "#374151" : "#e5e7eb",
                backgroundColor: isDark ? "#1f2937" : "#f9fafb",
              },
            ]}
            defaultValue={user?.full_name || "Admin"}
            editable={false}
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>

        {/* Logout Button dengan hover effect */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? "#dc2626" : "#ef4444",
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>

        {/* Info Text */}
        <Text
          style={[styles.infoText, { color: isDark ? "#9ca3af" : "#6b7280" }]}
        ></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 60,
    right: 20,
    left: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeLabel: {
    fontSize: 18,
  },
  card: {
    alignItems: "center",
    borderRadius: 24,
    padding: 32,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginHorizontal: 4,
  },
  avatarContainer: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 4,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 64,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
});
