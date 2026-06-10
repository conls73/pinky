import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { US_CITIES } from "@/lib/usCities";
import { cardShadow, colors } from "@/theme/colors";
import { noOutline } from "@/theme/webStyle";

export function CitySearch({
  city,
  state,
  remote,
  onSelectCity,
  onToggleRemote,
}: {
  city: string;
  state: string;
  remote: boolean;
  onSelectCity: (city: string, state: string) => void;
  onToggleRemote: (value: boolean) => void;
}) {
  const initial = city ? (state ? `${city}, ${state}` : city) : "";
  const [query, setQuery] = useState(initial);
  const [focused, setFocused] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const exact = `${city}, ${state}`.toLowerCase();
    if (q === exact) return []; // already chosen
    return US_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6);
  }, [query, city, state]);

  function choose(entry: string) {
    const [c, s] = entry.split(",").map((p) => p.trim());
    onSelectCity(c ?? entry, s ?? "");
    setQuery(entry);
    setFocused(false);
  }

  return (
    <View>
      {/* Remote toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Open to remote work</Text>
        <Switch
          value={remote}
          onValueChange={onToggleRemote}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.border}
        />
      </View>

      {remote ? (
        <View style={styles.remoteNote}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.muted}
          />
          <Text style={styles.remoteNoteText}>
            Searching remote roles — no location needed.
          </Text>
        </View>
      ) : (
        <View style={styles.searchWrap}>
          <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
            <TextInput
              style={[styles.input, noOutline]}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setFocused(true);
              }}
              onFocus={() => setFocused(true)}
              placeholder="Search a city…"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => {
                  setQuery("");
                  onSelectCity("", "");
                  setFocused(true);
                }}
                hitSlop={8}
              >
                <Text style={styles.clear}>Clear</Text>
              </Pressable>
            )}
          </View>

          {focused && matches.length > 0 && (
            <View style={styles.suggestions}>
              {matches.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => choose(m)}
                  style={({ pressed }) => [
                    styles.suggestion,
                    pressed && styles.suggestionPressed,
                  ]}
                >
                  <Text style={styles.suggestionText}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  toggleLabel: { color: colors.ink, fontSize: 15, fontWeight: "500" },
  remoteNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  remoteNoteText: { color: colors.muted, fontSize: 14 },
  searchWrap: { position: "relative" },
  inputRow: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputRowFocused: { borderColor: colors.accent },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
  },
  clear: { color: colors.accent, fontWeight: "600", fontSize: 13 },
  suggestions: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
    overflow: "hidden",
    ...cardShadow,
  },
  suggestion: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionPressed: { backgroundColor: colors.accentSoft },
  suggestionText: { color: colors.ink, fontSize: 15 },
});
