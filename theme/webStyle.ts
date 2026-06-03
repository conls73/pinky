import { Platform } from "react-native";

// Removes the default browser focus outline (the black box) on web inputs.
// No-op on native. Cast to any because RN's style types don't include the
// web-only `outline*` props that react-native-web understands.
export const noOutline: any = Platform.select({
  web: { outlineStyle: "none", outlineWidth: 0 },
  default: {},
});
