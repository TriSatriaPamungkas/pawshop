import { useTheme } from "@react-navigation/native";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header toggle di kanan atas */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Paw Profile</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#aaa", true: "#4CAF50" }}
          thumbColor={isDark ? "#fff" : "#000"}
        />
      </View>

      {/* Card Profile di tengah */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#ccc",
          },
        ]}
      >
        <Image
          source={require("../../assets/images/profile.png")}
          style={styles.avatar}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: isDark ? "#222" : "#f8f8f8",
            },
          ]}
          defaultValue="Admin"
          editable={false}
        />
        <Pressable
          style={[styles.button, { backgroundColor: "#ff5252" }]}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  header: {
    position: "absolute",
    top: 50,
    right: 20,
    left: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "600" },
  card: {
    alignItems: "center",
    borderRadius: 16,
    padding: 24,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 30,
    padding: 12,

    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
