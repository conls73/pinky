import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CitySearch } from "@/components/CitySearch";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { postJson } from "@/lib/api";
import { usePinky } from "@/store/usePinky";
import { colors } from "@/theme/colors";
import { noOutline } from "@/theme/webStyle";
import { RankedLead, ResumeProfile } from "@/types";

const RESUME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function readAsBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const res = await fetch(uri);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return dataUrl.split(",")[1] ?? "";
  }
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

const EXAMPLES = [
  "Hands-on, full-time",
  "Weekend gigs for cash",
  "Entry level / will train",
  "Driving / delivery",
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    profile,
    setProfile,
    setResumeFileName,
    resumeFileName,
    params,
    setParams,
    setLeads,
  } = usePinky();
  const [work, setWork] = useState(params.preferencesText ?? "");
  const [parsing, setParsing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workFocused, setWorkFocused] = useState(false);

  async function pickAndParse() {
    setNote(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: RESUME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setResumeFileName(asset.name);
    setParsing(true);
    try {
      const base64 = await readAsBase64(asset.uri);
      const { profile } = await postJson<{ profile: ResumeProfile }>(
        "/parse-resume",
        { base64, mimeType: asset.mimeType ?? "application/pdf" }
      );
      setProfile(profile);
      setNote({
        text: "Resume uploaded — we'll use it to rank and personalize results.",
        ok: true,
      });
    } catch (err: any) {
      setNote({
        text: err?.noKey
          ? "Resume saved. Add an AI key to enable automatic parsing — you can still continue."
          : err?.message ?? "We couldn't read that file. You can still continue.",
        ok: false,
      });
    } finally {
      setParsing(false);
    }
  }

  const canSearch = params.remote || params.city.trim().length > 0;

  async function getStarted() {
    setError(null);
    const merged = { ...params, preferencesText: work };
    setParams({ preferencesText: work });
    setSearching(true);
    try {
      const { leads } = await postJson<{ leads: RankedLead[] }>("/search", {
        profile,
        params: merged,
      });
      setLeads(leads);
      router.push("/results");
    } catch (err: any) {
      setError(err?.message ?? "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Find work near you</Text>
        <Text style={styles.tagline}>
          Upload your resume, tell us what you're looking for, and get a ranked
          list of local openings with tailored cover letters.
        </Text>
      </View>

      <Text style={styles.label}>Resume</Text>
      <Pressable
        onPress={pickAndParse}
        disabled={parsing}
        style={({ pressed }) => [styles.drop, pressed && styles.dropPressed]}
      >
        <Ionicons
          name={resumeFileName ? "document-text-outline" : "cloud-upload-outline"}
          size={32}
          color={colors.accent}
        />
        <Text style={styles.dropTitle}>
          {resumeFileName ?? "Upload your resume"}
        </Text>
        <Text style={styles.dropHint}>
          {parsing ? "Reading your resume…" : "PDF, Word document, or text file"}
        </Text>
      </Pressable>
      {note ? (
        <View style={styles.noteRow}>
          <Ionicons
            name={note.ok ? "checkmark-circle" : "information-circle-outline"}
            size={16}
            color={note.ok ? colors.success : colors.muted}
          />
          <Text
            style={[
              styles.note,
              { color: note.ok ? colors.success : colors.muted },
            ]}
          >
            {note.text}
          </Text>
        </View>
      ) : null}

      <Text style={[styles.label, styles.labelSpaced]}>
        What kind of work are you looking for?{" "}
        <Text style={styles.optional}>(optional)</Text>
      </Text>
      <TextInput
        style={[styles.area, workFocused && styles.areaFocused, noOutline]}
        value={work}
        onChangeText={setWork}
        onFocus={() => setWorkFocused(true)}
        onBlur={() => setWorkFocused(false)}
        placeholder="e.g. steady full-time work I can start soon…"
        placeholderTextColor={colors.placeholder}
        multiline
        textAlignVertical="top"
      />
      <View style={styles.examples}>
        {EXAMPLES.map((ex) => (
          <Pressable
            key={ex}
            onPress={() => setWork(ex)}
            style={({ pressed }) => [
              styles.example,
              pressed && styles.examplePressed,
            ]}
          >
            <Text style={styles.exampleText}>{ex}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, styles.labelSpaced]}>Location</Text>
      <CitySearch
        city={params.city}
        state={params.state}
        remote={params.remote}
        onSelectCity={(city, state) => setParams({ city, state })}
        onToggleRemote={(remote) => setParams({ remote })}
      />

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <PrimaryButton
          label={searching ? "Searching…" : "Find jobs"}
          loading={searching || parsing}
          onPress={getStarted}
          disabled={!canSearch}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 28 },
  logo: { width: 64, height: 64, resizeMode: "contain", marginBottom: 12 },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  tagline: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  label: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  optional: { color: colors.placeholder, fontWeight: "400" },
  labelSpaced: { marginTop: 28 },
  drop: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dropPressed: { backgroundColor: colors.surface },
  dropTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  dropHint: { color: colors.muted, fontSize: 13, marginTop: 4 },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
  },
  note: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  area: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    minHeight: 90,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 12,
  },
  areaFocused: { borderColor: colors.accent },
  examples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  example: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  examplePressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
  exampleText: {
    color: colors.inkSecondary,
    fontWeight: "500",
    fontSize: 12,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  error: {
    flex: 1,
    color: colors.error,
    fontWeight: "500",
    fontSize: 13,
  },
});
