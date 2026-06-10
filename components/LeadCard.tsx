import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SourceBadge } from "@/components/SourceBadge";
import { cardShadow, colors } from "@/theme/colors";
import { RankedLead } from "@/types";

export function LeadCard({
  lead,
  onPress,
}: {
  lead: RankedLead;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title} numberOfLines={2}>
        {lead.title}
      </Text>

      {lead.company ? <Text style={styles.company}>{lead.company}</Text> : null}

      <View style={styles.metaRow}>
        <SourceBadge source={lead.source} />
        {lead.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.meta}>{lead.location}</Text>
          </View>
        ) : null}
        {lead.pay ? (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={colors.muted} />
            <Text style={styles.meta}>{lead.pay}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.whyBox}>
        <Text style={styles.whyLabel}>Why this fits</Text>
        <Text style={styles.why}>{lead.whyItFits}</Text>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>View details</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
  },
  pressed: { backgroundColor: colors.surface },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  company: { color: colors.muted, marginTop: 2, fontSize: 14 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { color: colors.muted, fontSize: 13 },
  whyBox: {
    backgroundColor: colors.accentSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  whyLabel: {
    color: colors.accentPressed,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  why: { color: colors.inkSecondary, fontSize: 13, lineHeight: 19 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 2,
  },
  ctaText: { color: colors.accent, fontWeight: "600", fontSize: 13 },
});
