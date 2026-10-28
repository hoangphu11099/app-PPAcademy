import { StyleSheet } from "react-native";

export const interaction = StyleSheet.create({
  glow: {
    boxShadow: "0 0 0 3px rgba(37,99,235,0.16), 0 0 18px rgba(37,99,235,0.28)",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  inputFocus: {
    borderColor: "#2563EB",
    backgroundColor: "#F5F9FF",
  },
  selected: {
    backgroundColor: "#EAF2FF",
  },
});
