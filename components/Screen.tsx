import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { bgGradient } from "@/theme/colors";

/**
 * Pink gradient background + safe area, with content centered and width-capped
 * so it reads well on desktop web and fills narrow mobile screens.
 */
export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const inner = (
    <View style={styles.capped}>{children}</View>
  );

  return (
    <LinearGradient colors={bgGradient} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {inner}
            </ScrollView>
          ) : (
            <View style={styles.center}>{inner}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  capped: {
    width: "100%",
    maxWidth: 460,
  },
});
