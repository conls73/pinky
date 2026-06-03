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
import { colors } from "@/theme/colors";
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
        <Text style={styles.toggleLabel}>Work remotely</Text>
        <Switch
          value={remote}
          onValueChange={onToggleRemote}
          trackColor={{ false: "#ffffff66", true: colors.pinkDeep }}
          thumbColor={colors.white}
          ios_backgroundColor="#ffffff66"
        />
      </View>

      {remote ? (
        <View style={styles.remoteNote}>
          <Text style={styles.remoteNoteText}>
            Searching remote jobs — no location needed.
          </Text>
        </View>
      ) : (
        <View style={styles.searchWrap}>
          <View style={styles.inputRow}>
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
  toggleLabel: { color: colors.white, fontSize: 15, fontWeight: "600" },
  remoteNote: {
    backgroundColor: "#ffffff22",
    borderRadius: 14,
    padding: 14,
  },
  remoteNoteText: { color: colors.white, fontSize: 14, fontWeight: "600" },
  searchWrap: { position: "relative" },
  inputRow: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.pinkSoft,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.black,
  },
  clear: { color: colors.black, fontWeight: "700", fontSize: 13 },
  suggestions: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: colors.pinkDeep,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  suggestion: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2E2EC",
  },
  suggestionPressed: { backgroundColor: colors.pinkBg },
  suggestionText: { color: colors.black, fontSize: 15 },
});
