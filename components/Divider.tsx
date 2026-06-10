import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export function Divider({ label = "Or" }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    marginHorizontal: 12,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "500",
  },
});
