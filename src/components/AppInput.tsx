import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import { GlowTextInput as TextInput } from "@/src/components/GlowTextInput";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Colors from "../theme/colors";
import { interaction } from "../theme/interaction";

interface Props {
  placeholder: string;
  secure?: boolean;
  value: string;
  onChangeText: (v: string) => void;
}

export default function AppInput({
  placeholder,
  secure,
  value,
  onChangeText,
}: Props) {
  const [hide, setHide] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && interaction.inputFocus, focused && interaction.glow]}>
      <TextInput
        glowEnabled={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
        placeholder={placeholder}
        secureTextEntry={hide}
        value={value}
        onChangeText={onChangeText}
      />

      {secure && (
        <TouchableOpacity onPress={() => setHide(!hide)}>
          <Ionicons name={hide ? "eye-off" : "eye"} size={22} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },
});
