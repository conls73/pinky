import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

/**
 * White page background + safe area, with content width-capped so it reads
 * well on desktop web and fills narrow mobile screens. Long pages top-align;
 * pass `centered` for short screens like login.
 */
export function Screen({
  children,
  scroll = true,
  centered = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  centered?: boolean;
}) {
  const inner = <View style={styles.capped}>{children}</View>;

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                centered && styles.centeredContent,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {inner}
            </ScrollView>
          ) : (
            <View style={[styles.scrollContent, styles.centeredContent]}>
              {inner}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 32,
  },
  centeredContent: { justifyContent: "center" },
  capped: {
    width: "100%",
    maxWidth: 480,
  },
});
