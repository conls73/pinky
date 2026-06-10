import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LeadCard } from "@/components/LeadCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { postJson } from "@/lib/api";
import { usePinky } from "@/store/usePinky";
import { colors } from "@/theme/colors";
import { RankedLead } from "@/types";

const RADII = [5, 10, 25, 50];

function SkeletonCards() {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[styles.skeleton, { opacity: pulse }]}>
          <View style={[styles.skeletonLine, { width: "70%" }]} />
          <View style={[styles.skeletonLine, { width: "45%" }]} />
          <View style={[styles.skeletonBlock]} />
        </Animated.View>
      ))}
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const { profile, leads, params, setParams, setLeads, hasSearched } =
    usePinky();
  const [busy, setBusy] = useState(false);

  // Deep-link / fresh-session guard: nothing to show until a search has run.
  if (!hasSearched) return <Redirect href="/home" />;

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
      <StepHeader
        title={`${leads.length} ${leads.length === 1 ? "job" : "jobs"} found`}
        subtitle={subtitle}
      />

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
                  disabled={busy}
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
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.bannerText}>
            Showing sample listings. Add a SEARCHAPI_KEY to enable live Google
            Jobs results.
          </Text>
        </View>
      ) : null}

      {busy ? (
        <SkeletonCards />
      ) : leads.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={36} color={colors.placeholder} />
          <Text style={styles.emptyTitle}>No jobs matched</Text>
          <Text style={styles.emptyBody}>
            Try a wider radius, a different city, or broader preferences.
          </Text>
          <View style={styles.emptyAction}>
            <PrimaryButton label="Adjust search" onPress={() => router.back()} />
          </View>
        </View>
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
    color: colors.muted,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  chips: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.inkSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: colors.white },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: { flex: 1, color: colors.info, fontSize: 12, lineHeight: 17 },
  skeleton: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  skeletonBlock: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
  },
  emptyAction: { alignSelf: "stretch", marginTop: 12 },
});
