import React, { useState } from "react";
import { Image } from "react-native";
import { publicImage } from "../api/publicApi";

export function SchoolLogo({ url = "/pp-academy-logo.png", size = 52 }: { url?: string; size?: number }) {
  const [failed, setFailed] = useState<string>();
  return <Image source={publicImage(failed === url ? "/pp-academy-logo.png" : url)}
    accessibilityLabel="Logo PP Academy" onError={() => setFailed(url)}
    style={{ width: size, height: size, borderRadius: size / 5 }} resizeMode="cover" />;
}
