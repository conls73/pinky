import { useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/theme/colors";
import { noOutline } from "@/theme/webStyle";

export function Field({
  value,
  onChangeText,
  placeholder,
  secure = false,
  autoCapitalize = "none",
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secure?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
}) {
  const [hidden, setHidden] = useState(secure);
  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, noOutline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={hidden}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {secure && (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
          <Text style={styles.toggle}>{hidden ? "SHOW" : "HIDE"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.pinkSoft,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.black,
  },
  toggle: {
    color: colors.black,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
