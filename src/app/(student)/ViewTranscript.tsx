import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTranscriptAPI } from "../../api/authApi";
import { GlowTouchableOpacity as Button } from "../../components/GlowTouchableOpacity";
import { academicDate, scoreText } from "../../utils/academic";

type TranscriptItem = {
  id: number; courseCode: string; courseName: string; credits: number; classCode?: string;
  teacherName?: string; semester?: string; startDate?: string; endDate?: string;
  assignmentScore?: number; midtermScore?: number; finalScore?: number; totalScore?: number; gradeLetter?: string;
};

export default function ViewTranscript() {
  const [rows, setRows] = useState<TranscriptItem[]>([]);
  const [summary, setSummary] = useState({ gpa: 0, totalCredit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number[]>([]);
  const load = useCallback(async () => {
    try {
      const { data } = await getTranscriptAPI();
      setRows(Array.isArray(data.transcript) ? data.transcript : []);
      setSummary({ gpa: Number(data.gpa || 0), totalCredit: Number(data.totalCredit || 0) });
      setError(data.transcript?.length ? "" : data.message || "Chưa có điểm được công bố.");
    } catch { setError("Không tải được bảng điểm. Vui lòng kéo xuống để thử lại."); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const refresh = () => { setLoading(true); void load(); };
  const exportReport = async () => {
    if (!rows.length) { Alert.alert("Thông báo", "Chưa có bảng điểm để xuất."); return; }
    try {
      await Share.share({ title: "Bảng điểm PP Academy", message: [
        `BẢNG ĐIỂM PP ACADEMY · GPA ${summary.gpa}/4 · ${summary.totalCredit} tín chỉ`,
        ...rows.map(row => `${row.courseCode} · ${row.courseName} (${row.credits} TC)\nLớp: ${row.classCode || "Chưa cập nhật"} · GV: ${row.teacherName || "Chưa cập nhật"}\n${row.semester || ""} · ${academicDate(row.startDate)} – ${academicDate(row.endDate)}\nBài tập (30%): ${scoreText(row.assignmentScore)} · Giữa kỳ (30%): ${scoreText(row.midtermScore)} · Cuối kỳ (40%): ${scoreText(row.finalScore)}\nTổng kết: ${scoreText(row.totalScore)} · Điểm chữ: ${row.gradeLetter || "Chưa công bố"}`),
      ].join("\n\n") });
    } catch { Alert.alert("Thông báo", "Chưa chia sẻ được bảng điểm."); }
  };
  return <SafeAreaView style={styles.root} edges={["top"]}>
    <View style={styles.header}><Text style={styles.title}>Bảng điểm sinh viên</Text><Button accessibilityLabel="Chia sẻ bảng điểm chi tiết" onPress={exportReport} style={styles.export}><Ionicons name="download-outline" size={23} color="#2563EB" /></Button></View>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={["#2563EB"]} />}>
      <Text style={styles.muted}>PP Academy · Điểm đã được công bố</Text>
      <View style={styles.summary}>{[[`${summary.gpa}/4`, "GPA"], [String(summary.totalCredit), "Tín chỉ"], [String(rows.length), "Học phần"]].map(([value, label]) => <View key={label} style={{ flex: 1, alignItems: "center", gap: 6 }}><Text style={styles.value}>{value}</Text><Text style={styles.muted}>{label}</Text></View>)}</View>
      {error ? <Text accessibilityRole="alert" style={styles.muted}>{error}</Text> : null}
      {loading && !rows.length && <ActivityIndicator color="#2563EB" />}
      {rows.map(row => {
        const open = expanded.includes(row.id);
        return <View key={row.id} style={styles.card}>
          <Button onPress={() => setExpanded(current => open ? current.filter(id => id !== row.id) : [...current, row.id])} accessibilityState={{ expanded: open }} style={styles.cardHead}>
            <View style={{ flex: 1, gap: 6 }}><Text style={styles.code}>{row.courseCode} · {row.credits} tín chỉ</Text><Text style={styles.name}>{row.courseName}</Text><Text style={styles.muted}>{row.semester || "Học kỳ chưa cập nhật"}</Text></View>
            <View style={{ alignItems: "flex-end", gap: 5 }}><Text style={[styles.total, { color: row.gradeLetter === "F" ? "#DC2626" : "#1764C0" }]}>{scoreText(row.totalScore)}</Text><Text style={styles.name}>{row.gradeLetter || "—"}</Text><Text style={styles.code}>{open ? "Thu gọn ⌃" : "Chi tiết ⌄"}</Text></View>
          </Button>
          <View style={styles.info}><Text style={styles.body}>Giảng viên: {row.teacherName || "Chưa cập nhật"}</Text><Text style={styles.body}>Lớp: {row.classCode || "Chưa cập nhật"}</Text><Text style={styles.body}>Bắt đầu: {academicDate(row.startDate)}</Text><Text style={styles.body}>Kết thúc: {academicDate(row.endDate)}</Text></View>
          {open && <View style={styles.details}><Text style={styles.name}>Điểm thành phần · Thang 100</Text>{[["Bài tập", "30%", row.assignmentScore], ["Giữa kỳ", "30%", row.midtermScore], ["Cuối kỳ", "40%", row.finalScore]].map(([label, weight, score]) => <View key={String(label)} style={styles.scoreRow}><Text style={styles.body}>{label} ({weight})</Text><Text style={styles.name}>{scoreText(score)}</Text></View>)}<Text style={styles.muted}>Tổng kết = Bài tập × 30% + Giữa kỳ × 30% + Cuối kỳ × 40%. Ngày bắt đầu/kết thúc lấy từ lịch học phần; nếu chưa có ngày cụ thể thì dùng khoảng thời gian học kỳ.</Text></View>}
        </View>;
      })}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#F0F6FF" }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, backgroundColor: "white" }, title: { fontSize: 23, fontWeight: "800", color: "#123963", flex: 1 }, export: { padding: 12, borderRadius: 24, backgroundColor: "#EAF2FF" }, content: { padding: 18, gap: 18, paddingBottom: 32 }, muted: { fontSize: 13, color: "#64748B", lineHeight: 20 }, body: { fontSize: 14, color: "#334D6C", lineHeight: 22 }, summary: { flexDirection: "row", paddingVertical: 23, backgroundColor: "white", borderRadius: 20 }, value: { fontSize: 26, fontWeight: "800", color: "#2563EB" }, card: { backgroundColor: "white", borderRadius: 18, padding: 18, gap: 15 }, cardHead: { flexDirection: "row", gap: 12, alignItems: "center", borderRadius: 10 }, code: { color: "#2563EB", fontWeight: "600", fontSize: 12 }, name: { fontSize: 16, fontWeight: "700", color: "#123963" }, total: { fontSize: 20, fontWeight: "800" }, info: { gap: 4 }, details: { borderTopWidth: 1, borderColor: "#DBE8FA", paddingTop: 14, gap: 14 }, scoreRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 } });
