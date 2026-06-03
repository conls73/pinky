import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export function StepHeader({
  step,
  total = 2,
  title,
  subtitle,
  canGoBack = true,
}: {
  step?: number;
  total?: number;
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
}) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {canGoBack ? (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </Pressable>
        ) : (
          <View style={{ width: 26 }} />
        )}
        {step ? (
          <Text style={styles.step}>
            Step {step} of {total}
          </Text>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <View style={{ width: 26 }} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  step: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.white,
    opacity: 0.9,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },
});
