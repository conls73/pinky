import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { GoogleIcon } from "./GoogleIcon";

export function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: "google" | "apple";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        {icon === "google" ? (
          <GoogleIcon size={20} />
        ) : (
          <FontAwesome name="apple" size={20} color="#000" />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  pressed: { opacity: 0.85 },
  icon: { marginRight: 12, width: 20, alignItems: "center" },
  label: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
