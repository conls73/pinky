import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Redirect, useLocalSearchParams } from "expo-router";
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
import { cardShadow, colors } from "@/theme/colors";
import { CoverLetter } from "@/types";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, profile } = usePinky();
  const lead = leads.find((l) => l.id === id);

  const [letter, setLetter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stale or foreign id (e.g. an old deep link) — send the user somewhere useful.
  if (!lead) return <Redirect href={leads.length ? "/results" : "/home"} />;

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
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>{lead.location}</Text>
          </View>
        ) : null}
        {lead.pay ? (
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>{lead.pay}</Text>
          </View>
        ) : null}
        {lead.postedDate ? (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color={colors.muted} />
            <Text style={styles.meta}>{lead.postedDate}</Text>
          </View>
        ) : null}

        <View style={styles.whyBox}>
          <Text style={styles.whyLabel}>Why this fits you</Text>
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
            <Ionicons name="open-outline" size={16} color={colors.accent} />
            <Text style={styles.link}>Open original listing</Text>
          </View>
        ) : null}
      </Pressable>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

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
            <Ionicons name="refresh-outline" size={15} color={colors.accent} />
            <Text style={styles.regenText}>Rewrite</Text>
          </Pressable>
        </View>
      ) : (
        <PrimaryButton
          label={busy ? "Writing…" : "Generate cover letter"}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    ...cardShadow,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 10,
  },
  sourceText: { color: colors.muted, fontWeight: "600", fontSize: 11 },
  company: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  meta: { color: colors.muted, fontSize: 13 },
  whyBox: {
    backgroundColor: colors.accentSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  whyLabel: {
    color: colors.accentPressed,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  why: { color: colors.inkSecondary, fontSize: 13, lineHeight: 19 },
  descLabel: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  descScroll: {
    maxHeight: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  snippet: { color: colors.inkSecondary, fontSize: 13, lineHeight: 20 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  link: { color: colors.accent, fontWeight: "600", fontSize: 13 },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  error: { flex: 1, color: colors.error, fontSize: 13 },
  letterCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...cardShadow,
  },
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  letterTitle: { color: colors.ink, fontWeight: "700", fontSize: 14, flex: 1 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  copyText: { color: colors.white, fontWeight: "600", fontSize: 11 },
  letterScroll: { maxHeight: 340 },
  letterBody: { color: colors.inkSecondary, fontSize: 14, lineHeight: 22 },
  regen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
    padding: 10,
    marginTop: 4,
  },
  regenText: { color: colors.accent, fontWeight: "600", fontSize: 13 },
});
