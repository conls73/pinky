// Pink palette derived from the Pinky logo's hot pink.
export const colors = {
  pink: "#FF4FB0", // primary brand / buttons
  pinkDark: "#E0359B", // pressed / accents
  pinkDeep: "#C71585", // gradient bottom, headings
  pinkSoft: "#FF8FCB", // field borders / subtle
  pinkBg: "#FFE3F1", // screen background top
  white: "#FFFFFF", // field fills, text on pink
  ink: "#3A0A26", // dark text on light pink
  inkSoft: "#7A4763", // muted text
  black: "#111111", // text on white fields/cards
  placeholder: "#8A8A8A", // neutral placeholder on white
};

// Background gradient stops (top -> bottom). Saturated enough that white text
// stays readable across the whole screen.
export const bgGradient = ["#FF6FBE", colors.pink, colors.pinkDeep] as const;

export type Colors = typeof colors;
