// Light, professional palette. Neutrals carry the UI; the brand pink is an
// accent reserved for primary actions, links, and highlights.
export const colors = {
  // Brand accent
  accent: "#EC4899", // primary buttons, links, active states
  accentPressed: "#DB2777", // pressed / hover
  accentSoft: "#FDF2F8", // tinted fills (why-it-fits, pressed chips)
  accentBorder: "#FBCFE8", // tinted hairlines around accentSoft

  // Neutrals
  background: "#FFFFFF", // every screen background
  surface: "#F8FAFC", // subtle panels, badges, description wells
  border: "#E5E7EB", // hairline card/input borders
  ink: "#0F172A", // headings, primary text
  inkSecondary: "#334155", // body text
  muted: "#64748B", // secondary / meta text, labels
  placeholder: "#94A3B8",
  white: "#FFFFFF",

  // Status
  success: "#059669",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  info: "#1D4ED8",
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
};

// Shared soft shadow for cards so elevation looks consistent everywhere.
// shadow* maps to box-shadow on web; elevation covers Android.
export const cardShadow = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

export type Colors = typeof colors;
