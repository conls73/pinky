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
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setNote("Got it! Pinky read your resume. ✅");
    } catch (err: any) {
      setNote(
        err?.noKey
          ? "Saved your resume. (Add an AI key to auto-read it — you can still continue.)"
          : err?.message ?? "Couldn't read that file. You can still continue."
      );
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
      <View style={styles.logoBadge}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <Text style={styles.hi}>Welcome to Pinky</Text>
      <Text style={styles.tagline}>
        Upload your resume and tell Pinky what you want. Pinky hunts down local
        jobs, gigs, and temp work that fit you.
      </Text>

      <Text style={styles.label}>1. Upload your resume (PDF)</Text>
      <Pressable
        onPress={pickAndParse}
        disabled={parsing}
        style={({ pressed }) => [styles.drop, pressed && { opacity: 0.9 }]}
      >
        <Ionicons
          name={resumeFileName ? "document-text" : "cloud-upload-outline"}
          size={36}
          color={colors.pinkDeep}
        />
        <Text style={styles.dropTitle}>
          {resumeFileName ?? "Tap to choose a PDF"}
        </Text>
        <Text style={styles.dropHint}>
          {parsing ? "Reading your resume…" : "PDF, Word doc, or text file"}
        </Text>
      </Pressable>
      {note ? <Text style={styles.note}>{note}</Text> : null}

      <Text style={[styles.label, styles.labelSpaced]}>
        2. What kind of work? (optional)
      </Text>
      <TextInput
        style={[styles.area, noOutline]}
        value={work}
        onChangeText={setWork}
        placeholder="e.g. steady full-time work I can start soon…"
        placeholderTextColor={colors.placeholder}
        multiline
        textAlignVertical="top"
      />
      <View style={styles.examples}>
        {EXAMPLES.map((ex) => (
          <Text key={ex} style={styles.example} onPress={() => setWork(ex)}>
            {ex}
          </Text>
        ))}
      </View>

      <Text style={[styles.label, styles.labelSpaced]}>
        3. Where do you want to work?
      </Text>
      <CitySearch
        city={params.city}
        state={params.state}
        remote={params.remote}
        onSelectCity={(city, state) => setParams({ city, state })}
        onToggleRemote={(remote) => setParams({ remote })}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ marginTop: 24 }}>
        <PrimaryButton
          label={searching ? "FINDING JOBS…" : "GET STARTED"}
          loading={searching || parsing}
          onPress={getStarted}
          disabled={!canSearch}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: colors.pinkDeep,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logo: { width: 78, height: 78, resizeMode: "contain" },
  hi: {
    alignSelf: "center",
    color: colors.white,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  tagline: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 10,
  },
  labelSpaced: { marginTop: 28 },
  drop: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.pinkSoft,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dropTitle: {
    color: colors.black,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  dropHint: { color: colors.placeholder, fontSize: 13, marginTop: 4 },
  note: {
    color: colors.white,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  area: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.pinkSoft,
    padding: 16,
    minHeight: 90,
    fontSize: 15,
    color: colors.black,
    marginBottom: 12,
  },
  examples: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  example: {
    backgroundColor: colors.white,
    color: colors.black,
    fontWeight: "700",
    fontSize: 12,
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  error: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 13,
    marginTop: 14,
    textAlign: "center",
  },
});
