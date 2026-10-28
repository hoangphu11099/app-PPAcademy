import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import { BackgroundVideo } from "../components/HomeVideos";
import { SchoolLogo } from "../components/SchoolLogo";
import { homeClips as SLIDES } from "../content/homeVideos";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



function dashboardByRole(role?: string) {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "/(admin)/DashboardAdmin";
  if (r === "teacher") return "/(teacher)/DashboardTeacher";
  if (r === "student") return "/(student)/DashboardStudent";
  return null;
}



export default function Index() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);

  const [fade] = useState(() => new Animated.Value(0));
  const [slideY] = useState(() => new Animated.Value(24));
  const [imgOpacity] = useState(() => new Animated.Value(1));


  useEffect(() => {
    imgOpacity.setValue(0.25);
    Animated.timing(imgOpacity, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [active, imgOpacity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, [fade, slideY]);

  useEffect(() => {
    if (isLoading || !ready) return;
    const dash = token ? dashboardByRole(user && user.role) : null;
    if (dash) router.replace(dash);
  }, [isLoading, ready, token, user, router]);

  const goLogin = useCallback(() => {
    const dash = token ? dashboardByRole(user && user.role) : null;
    if (dash) router.replace(dash);
    else router.push("/(auth)/login");
  }, [token, user, router]);

  const selectSlide = (index: number) => {
    if (!failed.includes(index)) setActive(index);
  };
  const advance = (direction: number, errors = failed) => {
    for (let step = 1; step <= SLIDES.length; step++) {
      const next = (active + direction * step + SLIDES.length) % SLIDES.length;
      if (!errors.includes(next)) { setActive(next); return; }
    }
  };

  const scriptFont = Platform.OS === "ios" ? "Snell Roundhand" : "serif";

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
      />

      <Animated.View
        style={[styles.bgWrap, { opacity: imgOpacity }]}
        pointerEvents="none">
        <BackgroundVideo
          key={`${active}-${failed.length}`}
          index={active}
          loop={failed.length === SLIDES.length - 1}
          unavailable={failed.includes(active)}
          onEnd={() => advance(1)}
          onError={() => {
            const errors = [...new Set([...failed, active])];
            setFailed(errors);
            advance(1, errors);
          }}
        />
        <View style={styles.dim} />
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.header,
            { opacity: fade, transform: [{ translateY: slideY }] },
          ]}>
          <View style={styles.brandRow}>
            <SchoolLogo size={40} />
            <View>
              <Text style={styles.brandName}>PP Academy</Text>
              <Text style={styles.brandSub}>Thông tin nhà trường</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerLogin}
            onPress={goLogin}
            activeOpacity={0.85}>
            <Text style={styles.headerLoginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.hero,
            { opacity: fade, transform: [{ translateY: slideY }] },
          ]}>
          <Text style={[styles.heroLine1, { fontFamily: scriptFont }]}>
            Học tập hôm nay.
          </Text>
          <Text style={[styles.heroLine2, { fontFamily: scriptFont }]}>
            Sẵn sàng ngày mai.
          </Text>

          <Text style={styles.heroLead}>
            Thông tin nhà trường, chương trình học và các thông báo dành cho
            sinh viên, giảng viên.
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={goLogin}
              activeOpacity={0.9}>
              {isLoading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Text style={styles.ctaPrimaryText}>Đăng nhập hệ thống</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0F172A" />
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaSecondary}
              onPress={() => router.push("/programs")}
              activeOpacity={0.9}>
              <Text style={styles.ctaSecondaryText}>Tìm hiểu ngành học</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={() =>
              advance(-1)
            }>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.tabs}>
            {SLIDES.map((s, i) => {
              const on = i === active;
              return (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.tab, on && styles.tabOn]}
                  disabled={failed.includes(i)}
                  accessibilityState={{ selected: on, disabled: failed.includes(i) }}
                  onPress={() => selectSlide(i)}
                  activeOpacity={0.85}>
                  <Text
                    style={[styles.tabText, on && styles.tabTextOn]}
                    numberOfLines={1}>
                    {i === 0 ? "Sinh viên" : s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.navArrow}
            onPress={() => advance(1)}>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#102C51" },
  safe: { flex: 1 },
  bgWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  dim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 30, 65, 0.48)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#143F73",
    borderWidth: 2,
    borderColor: "#C9A227",
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetters: {
    color: "#F5E6A8",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  brandName: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  brandSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 },
  headerLogin: {
    backgroundColor: "#1764C0",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
  },
  headerLoginText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroLine1: {
    fontSize: 40,
    color: "#FFFFFF",
    lineHeight: 50,
    marginBottom: 2,
    fontStyle: "italic",
  },
  heroLine2: {
    fontSize: 40,
    color: "#B9DCFF",
    lineHeight: 50,
    marginBottom: 16,
    fontStyle: "italic",
  },
  heroLead: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 21,
    maxWidth: "88%",
    marginBottom: 22,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  ctaPrimary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaPrimaryText: { color: "#0F172A", fontWeight: "700", fontSize: 14 },
  ctaSecondary: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ctaSecondaryText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 14,
    paddingTop: 6,
    gap: 4,
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  tabOn: {
    backgroundColor: "rgba(23, 100, 192, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tabText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600",
  },
  tabTextOn: { color: "#FFFFFF", fontWeight: "700" },
});
