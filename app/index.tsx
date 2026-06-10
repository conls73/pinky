import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Divider } from "@/components/Divider";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SocialButton } from "@/components/SocialButton";
import { cardShadow, colors } from "@/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // No real auth yet — login, social, and skip all enter the app (bypass).
  const enter = () => router.replace("/home");

  return (
    <Screen centered>
      <View style={styles.logoBadge}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <Text style={styles.brand}>Pinky</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to find jobs near you.</Text>

      <Field
        value={email}
        onChangeText={setEmail}
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
      />
      <Field
        value={password}
        onChangeText={setPassword}
        label="Password"
        placeholder="Your password"
        secure
      />

      <Pressable onPress={enter} hitSlop={8} style={styles.forgotWrap}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>

      <PrimaryButton label="Log in" onPress={enter} />

      <Divider label="Or" />

      <SocialButton label="Continue with Google" icon="google" onPress={enter} />
      <SocialButton label="Continue with Apple" icon="apple" onPress={enter} />

      {/* Bypass — skip auth for now and go straight into the app */}
      <Pressable
        onPress={enter}
        style={({ pressed }) => [styles.skip, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.skipText}>Continue without an account →</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>New to Pinky? </Text>
        <Pressable onPress={enter} hitSlop={6}>
          <Text style={styles.footerLink}>Create an account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...cardShadow,
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  brand: {
    alignSelf: "center",
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 10,
  },
  title: {
    alignSelf: "center",
    color: colors.ink,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
  },
  subtitle: {
    alignSelf: "center",
    color: colors.muted,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 24,
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 20 },
  forgot: { color: colors.accent, fontWeight: "600", fontSize: 13 },
  skip: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  footerMuted: { color: colors.muted, fontSize: 13 },
  footerLink: { color: colors.accent, fontWeight: "600", fontSize: 13 },
});
