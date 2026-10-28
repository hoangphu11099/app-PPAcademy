import React, { forwardRef, useState } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { interaction } from "../theme/interaction";

type Props = TextInputProps & { glowEnabled?: boolean };
export const GlowTextInput = forwardRef<React.ComponentRef<typeof TextInput>, Props>(
  function GlowTextInput({ style, onFocus, onBlur, glowEnabled = true, editable, ...props }, ref) {
    const [focused, setFocused] = useState(false);
    return <TextInput {...props} ref={ref} editable={editable} selectionColor="#2563EB"
      style={[style, focused && glowEnabled && editable !== false && interaction.inputFocus, focused && glowEnabled && editable !== false && interaction.glow]}
      onFocus={event => { setFocused(true); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }} />;
  },
);
