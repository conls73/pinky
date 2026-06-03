import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LeadCard } from "@/components/LeadCard";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { postJson } from "@/lib/api";
import { usePinky } from "@/store/usePinky";
import { colors } from "@/theme/colors";
import { RankedLead } from "@/types";

const RADII = [5, 10, 25, 50];

export default function ResultsScreen() {
  const router = useRouter();
  const { profile, leads, params, setParams, setLeads } = usePinky();
  const [busy, setBusy] = useState(false);
  const isSample = leads.some((l) => l.id.startsWith("sample-"));
  const area = [params.city, params.state].filter(Boolean).join(", ");
  const subtitle = params.remote
    ? "Remote jobs"
    : area
    ? `Near ${area}`
    : "Ranked for you";

  async function applyRadius(radiusMiles: number) {
    if (radiusMiles === params.radiusMiles || busy) return;
    setParams({ radiusMiles });
    setBusy(true);
    try {
      const { leads } = await postJson<{ leads: RankedLead[] }>("/search", {
        profile,
        params: { ...params, radiusMiles },
      });
      setLeads(leads);
    } catch {
      // keep existing results on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <StepHeader title={`${leads.length} jobs found`} subtitle={subtitle} />

      {!params.remote && (
        <>
          <Text style={styles.filterLabel}>Within</Text>
          <View style={styles.chips}>
            {RADII.map((r) => {
              const active = r === params.radiusMiles;
              return (
                <Pressable
                  key={r}
                  onPress={() => applyRadius(r)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {r} mi
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {isSample ? (
        <View style={styles.banner}>
          <Ionicons name="information-circle" size={18} color={colors.pinkDeep} />
          <Text style={styles.bannerText}>
            Showing sample jobs. Add a SEARCHAPI_KEY in .env for live Google
            Jobs results.
          </Text>
        </View>
      ) : null}

      {busy ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.white} />
          <Text style={styles.loadingText}>Updating jobs…</Text>
        </View>
      ) : leads.length === 0 ? (
        <Text style={styles.empty}>
          No jobs yet. Go back and try a wider area or different preferences.
        </Text>
      ) : (
        leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onPress={() => router.push(`/lead/${encodeURIComponent(lead.id)}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterLabel: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", gap: 10, marginBottom: 18 },
  chip: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  chipActive: { backgroundColor: colors.pinkDeep },
  chipText: { color: colors.black, fontWeight: "700" },
  chipTextActive: { color: colors.white },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 17 },
  loading: { alignItems: "center", paddingVertical: 30, gap: 10 },
  loadingText: { color: colors.white, fontWeight: "600" },
  empty: {
    color: colors.white,
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
    lineHeight: 21,
  },
});
