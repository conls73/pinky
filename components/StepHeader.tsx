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
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        {step ? (
          <Text style={styles.step}>
            Step {step} of {total}
          </Text>
        ) : null}
        <View style={styles.backSpacer} />
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
    marginBottom: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: { backgroundColor: colors.surface },
  backSpacer: { width: 36 },
  step: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 13,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },
});
