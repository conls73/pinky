import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Pressable } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SourceBadge } from "@/components/SourceBadge";
import { StepHeader } from "@/components/StepHeader";
import { draftCoverLetter } from "@/lib/coverLetter";
import { destinationFor } from "@/lib/destination";
import { usePinky } from "@/store/usePinky";
import { cardShadow, colors } from "@/theme/colors";
import { noOutline } from "@/theme/webStyle";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, profile } = usePinky();
  const lead = leads.find((l) => l.id === id);

  // Cover letter is drafted on-device (no API, no cost) and is fully editable.
  const [letter, setLetter] = useState(() =>
    lead ? draftCoverLetter(profile, lead) : ""
  );
  const [copied, setCopied] = useState(false);

  // Stale or foreign id (e.g. an old deep link) — send the user somewhere useful.
  if (!lead) return <Redirect href={leads.length ? "/results" : "/home"} />;

  const showBadge = !!destinationFor(lead.source, lead.url);

  function goToJob() {
    if (lead?.url) Linking.openURL(lead.url);
  }

  function rewrite() {
    if (lead) setLetter(draftCoverLetter(profile, lead));
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

      <View style={styles.card}>
        {showBadge ? (
          <View style={styles.badgeRow}>
            <SourceBadge source={lead.source} url={lead.url} />
          </View>
        ) : null}
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
      </View>

      {/* Primary action: send the user to the actual listing to apply. */}
      {lead.url ? (
        <View style={styles.goWrap}>
          <PrimaryButton label="Go to job" onPress={goToJob} />
        </View>
      ) : null}

      {/* Editable cover-letter draft. */}
      <View style={styles.letterCard}>
        <View style={styles.letterHeader}>
          <Text style={styles.letterTitle}>Cover letter</Text>
          <Pressable onPress={copy} hitSlop={8} style={styles.copyBtn}>
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={15}
              color={colors.white}
            />
            <Text style={styles.copyText}>{copied ? "Copied" : "Copy"}</Text>
          </Pressable>
        </View>
        <TextInput
          style={[styles.letterInput, noOutline]}
          value={letter}
          onChangeText={setLetter}
          multiline
          textAlignVertical="top"
          placeholder="Write or edit your cover letter here…"
          placeholderTextColor={colors.placeholder}
        />
        <Pressable onPress={rewrite} style={styles.regen} hitSlop={8}>
          <Ionicons name="refresh-outline" size={15} color={colors.accent} />
          <Text style={styles.regenText}>Start a fresh draft</Text>
        </Pressable>
      </View>
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
  badgeRow: { marginBottom: 10 },
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
  goWrap: { marginBottom: 16 },
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
  letterInput: {
    minHeight: 280,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.inkSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
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
