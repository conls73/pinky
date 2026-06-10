import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { JobSourceName } from "@/types";

// Sources with a recognizable destination site get their favicon in the badge
// so people know where the listing will take them. Google Jobs results link
// out to arbitrary employer sites, so they stay a plain text badge.
const SOURCE_DOMAINS: Partial<Record<JobSourceName, string>> = {
  Craigslist: "craigslist.org",
  RemoteOK: "remoteok.com",
  Indeed: "indeed.com",
  LinkedIn: "linkedin.com",
  ZipRecruiter: "ziprecruiter.com",
  Thumbtack: "thumbtack.com",
};

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function SourceBadge({ source }: { source: JobSourceName }) {
  const domain = SOURCE_DOMAINS[source];
  return (
    <View style={styles.badge}>
      {domain ? (
        <Image source={{ uri: faviconUrl(domain) }} style={styles.icon} />
      ) : null}
      <Text style={styles.text}>{source}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  icon: { width: 13, height: 13, borderRadius: 3 },
  text: { color: colors.muted, fontWeight: "600", fontSize: 11 },
});
