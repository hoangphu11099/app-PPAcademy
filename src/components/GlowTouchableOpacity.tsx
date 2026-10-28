import React, { forwardRef, useState } from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { interaction } from "../theme/interaction";

type Props = TouchableOpacityProps & { selected?: boolean };

// Keep each screen's colors, layout and callbacks; add feedback during interaction.
export const GlowTouchableOpacity = forwardRef<React.ComponentRef<typeof TouchableOpacity>, Props>(
  function GlowTouchableOpacity({ style, selected, disabled, activeOpacity = 0.9, accessibilityState, onPressIn, onPressOut, onFocus, onBlur, ...props }, ref) {
    const [pressed, setPressed] = useState(false);
    const [focused, setFocused] = useState(false);
    const isDisabled = disabled || accessibilityState?.disabled;
    const active = !isDisabled && (pressed || focused || selected || accessibilityState?.selected || accessibilityState?.checked === true || accessibilityState?.expanded);
    return <TouchableOpacity {...props} ref={ref} disabled={disabled} activeOpacity={activeOpacity}
      accessibilityState={{ ...accessibilityState, ...(selected === undefined ? {} : { selected }) }}
      style={[style, active && interaction.glow]}
      onPressIn={event => { setPressed(true); onPressIn?.(event); }}
      onPressOut={event => { setPressed(false); onPressOut?.(event); }}
      onFocus={event => { setFocused(true); onFocus?.(event); }}
      onBlur={event => { setFocused(false); onBlur?.(event); }} />;
  },
);
