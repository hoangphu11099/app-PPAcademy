import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import React, { useEffect, useState } from "react";
import { AppState, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useIsFocused } from "expo-router";
import { publicImage } from "../api/publicApi";
import { homeClips as clips } from "../content/homeVideos";



function Clip({ index, onEnd, onError, playing, loop }: { index: number; onEnd: () => void; onError: () => void; playing: boolean; loop: boolean }) {
  const player = useVideoPlayer(clips[index].source, p => { p.muted = true; p.loop = loop; });
  useEventListener(player, "playToEnd", onEnd);
  useEventListener(player, "statusChange", event => { if (event.status === "error") onError(); });
  useEffect(() => {
    if (playing && AppState.currentState === "active") player.play();
    else player.pause();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active" && playing) player.play(); else player.pause();
    });
    return () => subscription.remove();
  }, [player, playing]);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} surfaceType="textureView" />;
}

export function BackgroundVideo({ index, onEnd, onError, loop, unavailable }: {
  index: number; onEnd: () => void; onError: () => void; loop: boolean; unavailable: boolean;
}) {
  const focused = useIsFocused();
  return <>
    <Image source={publicImage("/pp-academy-campus.webp")} style={StyleSheet.absoluteFill} resizeMode="cover" />
    {!unavailable && <Clip index={index} onEnd={onEnd} onError={onError} playing={focused} loop={loop} />}
  </>;
}

export function HomeVideos({ poster, visible = true }: { poster: string; visible?: boolean }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const focused = useIsFocused();
  const advance = (direction: number, errors = failed) => {
    for (let step = 1; step <= clips.length; step++) {
      const next = (index + direction * step + clips.length) % clips.length;
      if (!errors.includes(next)) { setIndex(next); return; }
    }
  };
  return <View>
    <View style={styles.video}>
      <Image source={publicImage(poster)} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {!failed.includes(index) && <Clip key={`${index}-${failed.length}`} index={index} playing={focused && visible && !paused} loop={failed.length === clips.length - 1}
        onEnd={() => advance(1)}
        onError={() => { const errors = [...new Set([...failed, index])]; setFailed(errors); advance(1, errors); }} />}
      <View style={styles.caption}><Text style={styles.captionText}>{clips[index]?.label || "PP Academy"}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => { if (failed.length === clips.length) { setFailed([]); setIndex(0); } else setPaused(p => !p); }}>
          <Text style={styles.captionText}>{failed.length === clips.length ? "Thử lại video" : paused ? "▶ Phát" : "Ⅱ Tạm dừng"}</Text>
        </TouchableOpacity></View>
    </View>
    {failed.length === clips.length && <Text style={styles.note}>Chưa phát được video. Đang hiển thị ảnh trường.</Text>}
    <View style={styles.controls}>
      <TouchableOpacity accessibilityLabel="Video trước" onPress={() => advance(-1)}><Text style={styles.arrow}>‹</Text></TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {clips.map((clip, i) => <TouchableOpacity key={clip.label} accessibilityRole="button" accessibilityState={{ selected: i === index, disabled: failed.includes(i) }} disabled={failed.includes(i)} onPress={() => setIndex(i)} style={[styles.tab, i === index && styles.selected, failed.includes(i) && { opacity: 0.4 }]}><Text style={[styles.label, i === index && { color: "white" }]}>{clip.label}</Text></TouchableOpacity>)}
      </ScrollView>
      <TouchableOpacity accessibilityLabel="Video tiếp theo" onPress={() => advance(1)}><Text style={styles.arrow}>›</Text></TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  video: { height: 250, overflow: "hidden", borderRadius: 20, backgroundColor: "#102C51" },
  caption: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: "rgba(8,35,72,.8)", flexDirection: "row", justifyContent: "space-between" },
  captionText: { color: "white", fontWeight: "600", fontSize: 12 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  tabs: { gap: 8 }, tab: { backgroundColor: "#EAF2FF", borderRadius: 20, padding: 10 }, selected: { backgroundColor: "#1764C0" },
  label: { color: "#174579", fontSize: 12 }, arrow: { color: "#1764C0", fontSize: 30, paddingHorizontal: 4 }, note: { color: "#536982", marginTop: 8 },
});
