import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
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
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>{lead.source}</Text>
        </View>
        {lead.location ? (
          <Text style={styles.meta}>📍 {lead.location}</Text>
        ) : null}
        {lead.pay ? <Text style={styles.meta}>💵 {lead.pay}</Text> : null}
      </View>

      <View style={styles.whyBox}>
        <Text style={styles.whyLabel}>Why it fits</Text>
        <Text style={styles.why}>{lead.whyItFits}</Text>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>View & write cover letter</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.pinkDeep} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.pinkDeep,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.black,
  },
  company: { color: colors.black, marginTop: 2, fontSize: 14 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  sourceBadge: {
    backgroundColor: colors.pinkBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceText: { color: colors.black, fontWeight: "700", fontSize: 11 },
  meta: { color: colors.black, fontSize: 12 },
  whyBox: {
    backgroundColor: colors.pink,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  whyLabel: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  why: { color: colors.white, fontSize: 13, lineHeight: 19 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 4,
  },
  ctaText: { color: colors.black, fontWeight: "700", fontSize: 13 },
});
