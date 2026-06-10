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
          <FontAwesome name="apple" size={20} color={colors.ink} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  pressed: { backgroundColor: colors.surface },
  icon: { marginRight: 12, width: 20, alignItems: "center" },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
});
