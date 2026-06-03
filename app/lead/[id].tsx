import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { postJson } from "@/lib/api";
import { usePinky } from "@/store/usePinky";
import { colors } from "@/theme/colors";
import { CoverLetter } from "@/types";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { leads, profile } = usePinky();
  const lead = leads.find((l) => l.id === id);

  const [letter, setLetter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lead) {
    return (
      <Screen>
        <StepHeader title="Job not found" canGoBack />
        <PrimaryButton label="BACK TO JOBS" onPress={() => router.back()} />
      </Screen>
    );
  }

  function openListing() {
    if (lead?.url) Linking.openURL(lead.url);
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const { coverLetter } = await postJson<CoverLetter>("/message", {
        profile,
        lead,
      });
      setLetter(coverLetter);
    } catch (err: any) {
      setError(err?.message ?? "Couldn't write the cover letter. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!letter) return;
    await Clipboard.setStringAsync(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Screen>
      <StepHeader title={lead.title} canGoBack />

      {/* Tapping anywhere on this card opens the original listing. */}
      <Pressable
        onPress={openListing}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
      >
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>{lead.source}</Text>
        </View>
        {lead.company ? <Text style={styles.company}>{lead.company}</Text> : null}
        {lead.location ? (
          <Text style={styles.meta}>📍 {lead.location}</Text>
        ) : null}
        {lead.pay ? <Text style={styles.meta}>💵 {lead.pay}</Text> : null}
        {lead.postedDate ? (
          <Text style={styles.meta}>🕒 {lead.postedDate}</Text>
        ) : null}

        <View style={styles.whyBox}>
          <Text style={styles.whyLabel}>Why it fits you</Text>
          <Text style={styles.why}>{lead.whyItFits}</Text>
        </View>

        {lead.snippet ? (
          <>
            <Text style={styles.descLabel}>Job description</Text>
            <ScrollView
              style={styles.descScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <Text style={styles.snippet}>{lead.snippet}</Text>
            </ScrollView>
          </>
        ) : null}

        {lead.url ? (
          <View style={styles.linkRow}>
            <Ionicons name="open-outline" size={16} color={colors.pinkDeep} />
            <Text style={styles.link}>Tap anywhere to open the listing</Text>
          </View>
        ) : null}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {letter ? (
        <View style={styles.letterCard}>
          <View style={styles.letterHeader}>
            <Text style={styles.letterTitle}>Your cover letter</Text>
            <Pressable onPress={copy} hitSlop={8} style={styles.copyBtn}>
              <Ionicons
                name={copied ? "checkmark" : "copy-outline"}
                size={15}
                color={colors.white}
              />
              <Text style={styles.copyText}>{copied ? "Copied" : "Copy"}</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.letterScroll} nestedScrollEnabled>
            <Text style={styles.letterBody}>{letter}</Text>
          </ScrollView>
          <Pressable onPress={generate} style={styles.regen} hitSlop={8}>
            <Text style={styles.regenText}>↻ Rewrite</Text>
          </Pressable>
        </View>
      ) : (
        <PrimaryButton
          label={busy ? "WRITING…" : "GENERATE COVER LETTER"}
          loading={busy}
          onPress={generate}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.pinkBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  sourceText: { color: colors.black, fontWeight: "700", fontSize: 11 },
  company: { color: colors.black, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  meta: { color: colors.black, fontSize: 13, marginTop: 2 },
  whyBox: {
    backgroundColor: colors.pink,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  whyLabel: { color: colors.white, fontWeight: "800", fontSize: 11, marginBottom: 4 },
  why: { color: colors.white, fontSize: 13, lineHeight: 19 },
  descLabel: {
    color: colors.black,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  descScroll: {
    maxHeight: 220,
    backgroundColor: "#FBF2F7",
    borderRadius: 12,
    padding: 12,
  },
  snippet: { color: colors.black, fontSize: 13, lineHeight: 20 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  link: { color: colors.black, fontWeight: "700", fontSize: 13 },
  error: { color: colors.white, fontSize: 13, marginBottom: 12, textAlign: "center" },
  letterCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  letterTitle: { color: colors.black, fontWeight: "800", fontSize: 14, flex: 1 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.pinkDeep,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  copyText: { color: colors.white, fontWeight: "700", fontSize: 11 },
  letterScroll: { maxHeight: 340 },
  letterBody: { color: colors.black, fontSize: 14, lineHeight: 22 },
  regen: { alignSelf: "center", padding: 10, marginTop: 4 },
  regenText: { color: colors.pinkDeep, fontWeight: "700" },
});
