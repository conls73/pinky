import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Divider } from "@/components/Divider";
import { Field } from "@/components/Field";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SocialButton } from "@/components/SocialButton";
import { colors } from "@/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // No real auth yet — login, social, and skip all enter the app (bypass).
  const enter = () => router.replace("/home");

  return (
    <Screen>
      <View style={styles.logoBadge}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <Text style={styles.brand}>Pinky</Text>
      <Text style={styles.title}>Log in</Text>

      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="Username or Email"
        keyboardType="email-address"
      />
      <Field
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secure
      />

      <Pressable onPress={enter} hitSlop={8} style={styles.forgotWrap}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>

      <PrimaryButton label="LOG IN" onPress={enter} />

      <Divider label="Or" />

      <SocialButton
        label="LOG IN WITH GOOGLE"
        icon="google"
        onPress={enter}
      />
      <SocialButton label="LOG IN WITH APPLE" icon="apple" onPress={enter} />

      {/* Bypass — skip auth for now and go straight into the app */}
      <Pressable
        onPress={enter}
        style={({ pressed }) => [styles.skip, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.skipText}>Skip for now →</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>New to Pinky? </Text>
        <Pressable onPress={enter} hitSlop={6}>
          <Text style={styles.footerLink}>Sign up now.</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.pinkDeep,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logo: {
    width: 82,
    height: 82,
    resizeMode: "contain",
  },
  brand: {
    alignSelf: "center",
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    alignSelf: "center",
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  forgotWrap: { alignSelf: "center", marginBottom: 20 },
  forgot: { color: colors.white, fontWeight: "700", fontSize: 13 },
  skip: {
    alignSelf: "center",
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  footerMuted: { color: colors.white, opacity: 0.85, fontSize: 13 },
  footerLink: { color: colors.white, fontWeight: "800", fontSize: 13 },
});
