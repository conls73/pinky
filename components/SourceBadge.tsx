import { Image, StyleSheet, Text, View } from "react-native";
import { destinationFor, faviconUrl } from "@/lib/destination";
import { colors } from "@/theme/colors";
import { JobSourceName } from "@/types";

/**
 * Badges a listing by where its link actually goes (Indeed, ZipRecruiter,
 * Craigslist, etc.) with that site's logo. Listings that go to an employer's
 * own site show nothing here — the company name speaks for itself.
 */
export function SourceBadge({
  source,
  url,
}: {
  source: JobSourceName;
  url?: string;
}) {
  const dest = destinationFor(source, url);
  if (!dest) return null;

  return (
    <View style={styles.badge}>
      <Image source={{ uri: faviconUrl(dest.domain) }} style={styles.icon} />
      <Text style={styles.text}>{dest.label}</Text>
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
