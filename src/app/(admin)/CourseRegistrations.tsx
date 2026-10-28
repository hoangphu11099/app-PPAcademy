import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import api from "../../api/axios";
import { GlowTouchableOpacity as Button } from "../../components/GlowTouchableOpacity";
import { GlowTextInput as Input } from "../../components/GlowTextInput";
import { type RegistrationRow, type RegistrationOffering, registrationLabels } from "../../type/registrations";
import { academicDate } from "../../utils/academic";

type Teacher = { ID: number; MajorID: number; TeacherCode: string; User?: { FullName: string } };
type Room = { ID: number; Name: string };

export default function CourseRegistrations() {
  const router = useRouter();
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [offerings, setOfferings] = useState<RegistrationOffering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<RegistrationRow>();
  const [targetID, setTargetID] = useState(0);
  const [editSchedule, setEditSchedule] = useState(false);
  const [draft, setDraft] = useState({ teacherId: 0, roomId: 0, dates: "", startTime: "07:30", endTime: "11:30" });
  const load = useCallback(async () => {
    try {
      const [list, offers, meta] = await Promise.all([api.get("/admin/course-registrations"), api.get("/course-offerings"), api.get("/metadata")]);
      if (list.status !== 200 || offers.status !== 200) throw new Error("Backend chưa có chức năng đăng ký mới. Vui lòng cập nhật và khởi động lại backend.");
      setRows(list.data.data || []); setOfferings(offers.data.data || []);
      setTeachers(meta.data.data?.teachers || []); setRooms(meta.data.data?.rooms || []); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được danh sách"); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const refresh = () => { setLoading(true); void load(); };
  const mutation = async (row: RegistrationRow, kind: "confirm-payment" | "schedule", body: object) => {
    if (busy) return;
    setBusy(true);
    try { const result = await api.put(`/admin/course-registrations/${row.ID}/${kind}`, body); Alert.alert("Thành công", result.data.message); setSelected(undefined); await load(); }
    catch (reason: unknown) { const failure = reason as { response?: { data?: { message?: string } } }; Alert.alert("Chưa thực hiện được", failure.response?.data?.message || "Vui lòng thử lại."); }
    finally { setBusy(false); }
  };
  const confirmPayment = (row: RegistrationRow) => Alert.alert("Xác nhận đã thu học phí", `${row.Student?.User?.FullName} · ${row.Course?.Name}\nChỉ xác nhận khi học vụ đã kiểm tra sinh viên đóng học phí cho học phần này.`, [{ text: "Quay lại", style: "cancel" }, { text: "Đã thu học phí", onPress: () => void mutation(row, "confirm-payment", {}) }]);
  const showDetails = (row: RegistrationRow) => Alert.alert("Chi tiết đăng ký học phần", [
    `${row.Student?.User?.FullName || ""} · ${row.Student?.StudentCode || ""}`,
    `${row.Course?.Name || ""} · ${row.Class?.ClassCode || ""}`,
    `Học kỳ: ${row.CourseOffering?.Semester?.Name || "Chưa cập nhật"}`,
    registrationLabels[row.Status] || row.Status,
    row.PaymentConfirmedAt ? `Học phí đã xác nhận: ${academicDate(row.PaymentConfirmedAt)}` : "Chưa đối chiếu / xác nhận học phí",
    `GV: ${row.CourseOffering?.Teacher?.User?.FullName || "Chưa phân công"} · Phòng: ${row.CourseOffering?.Room?.Name || "Chưa xếp"}`,
    ...(row.CourseOffering?.Schedules || []).map(lesson => `${lesson.FullDate ? academicDate(lesson.FullDate) : lesson.DayOfWeek}: ${lesson.StartTime}–${lesson.EndTime}`),
    ...(row.Status === "registered" ? ["Đăng ký cũ: đối chiếu học phí trước khi xác nhận. Lịch và kết quả học tập hiện có được giữ nguyên."] : []),
  ].join("\n"));
  const openSchedule = (row: RegistrationRow) => {
    const offering = row.CourseOffering;
    setTargetID(offering?.ID || 0); setEditSchedule(!offering?.Schedules?.length);
    setDraft({ teacherId: offering?.TeacherID || 0, roomId: offering?.RoomID || 0, dates: "", startTime: "07:30", endTime: "11:30" }); setSelected(row);
  };
  const eligible = offerings.filter(offering => offering.CourseID === selected?.CourseID && offering.SemesterID === selected?.CourseOffering?.SemesterID);
  const target = eligible.find(offering => offering.ID === targetID);
  const saveSchedule = () => {
    if (!selected || !target) return;
    if (editSchedule && (!draft.teacherId || !draft.roomId || !draft.dates.trim())) { Alert.alert("Thiếu thông tin", "Vui lòng chọn giảng viên, phòng và ngày học."); return; }
    void mutation(selected, "schedule", { courseOfferingId: targetID, ...(editSchedule ? { assignment: { teacherId: draft.teacherId, roomId: draft.roomId, teachingDates: draft.dates.split(/[\s,;]+/).filter(Boolean), startTime: draft.startTime, endTime: draft.endTime } } : {}) });
  };
  const visible = rows.filter(row => (!status || row.Status === status) && `${row.Student?.StudentCode} ${row.Student?.User?.FullName} ${row.Course?.Name} ${row.Class?.ClassCode}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
  return <SafeAreaView style={styles.root} edges={["top"]}>
    <View style={styles.header}><Button onPress={() => router.back()}><Text style={styles.link}>← Quay lại</Text></Button><Text style={styles.title}>Đăng ký học phần</Text></View>
    <View style={styles.tools}><Text style={styles.body}>{rows.filter(row => row.Status === "pending_payment").length} chờ học phí · {rows.filter(row => row.Status === "paid").length} chờ xếp lịch</Text><Input style={styles.input} accessibilityLabel="Tìm sinh viên hoặc môn học" placeholder="Tìm mã SV, họ tên, môn học…" placeholderTextColor="#64748B" value={query} onChangeText={setQuery} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>{[["", "Tất cả"], ...Object.entries(registrationLabels)].map(([value, label]) => <Button key={value} selected={status === value} style={[styles.chip, status === value && styles.active]} onPress={() => setStatus(value)}><Text style={status === value ? styles.white : styles.link}>{label}</Text></Button>)}</ScrollView>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</View>
    {loading && !rows.length ? <ActivityIndicator color="#2563EB" /> : <FlatList data={visible} keyExtractor={row => String(row.ID)} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={["#2563EB"]} />} ListEmptyComponent={<Text style={styles.body}>Chưa có đăng ký phù hợp.</Text>} renderItem={({ item: row }) => <View style={styles.card}>
      <Text style={styles.name}>{row.Student?.User?.FullName}</Text><Text style={styles.link}>{row.Student?.StudentCode} · {row.Class?.ClassCode}</Text><Text style={styles.body}>{row.Student?.Phone || row.Student?.User?.Email}</Text><Text style={styles.name}>{row.Course?.Name}</Text><Text style={styles.body}>{row.Course?.Code} · {row.CourseOffering?.Semester?.Name}</Text><Text style={styles.body}>Đăng ký: {academicDate(row.RegisteredAt)}</Text><Text style={styles.link}>{registrationLabels[row.Status] || row.Status}</Text>{row.PaymentConfirmedAt && <Text style={styles.body}>Học phí đã xác nhận: {academicDate(row.PaymentConfirmedAt)}</Text>}
      {row.Status === "scheduled" && <><Text style={styles.body}>GV: {row.CourseOffering?.Teacher?.User?.FullName} · Phòng: {row.CourseOffering?.Room?.Name}</Text>{row.CourseOffering?.Schedules?.map(lesson => <Text key={lesson.ID} style={styles.body}>{lesson.FullDate ? academicDate(lesson.FullDate) : lesson.DayOfWeek} · {lesson.StartTime}–{lesson.EndTime}</Text>)}</>}
      <Button onPress={() => showDetails(row)}><Text style={styles.link}>Xem chi tiết đăng ký</Text></Button>
      {(row.Status === "pending_payment" || row.Status === "registered") && <Button disabled={busy} style={styles.button} onPress={() => confirmPayment(row)}><Text style={styles.white}>Xác nhận đã đóng học phí</Text></Button>}{row.Status === "paid" && <Button disabled={busy} style={styles.button} onPress={() => openSchedule(row)}><Text style={styles.white}>Xếp lịch học</Text></Button>}
    </View>} />}
    <Modal visible={Boolean(selected)} animationType="slide" onRequestClose={() => { if (!busy) setSelected(undefined); }}><SafeAreaView style={styles.root}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
      <Button disabled={busy} onPress={() => setSelected(undefined)}><Text style={styles.link}>← Đóng</Text></Button><Text style={styles.title}>Xếp lịch học phần</Text><Text style={styles.name}>{selected?.Student?.User?.FullName}</Text><Text style={styles.body}>{selected?.Course?.Name}</Text><Text style={styles.body}>Chọn lớp học phần cùng môn và học kỳ</Text><View style={styles.select}><Picker enabled={!busy} selectedValue={targetID} onValueChange={value => { const offering = eligible.find(item => item.ID === Number(value)); setTargetID(Number(value)); setEditSchedule(!offering?.Schedules?.length); setDraft(current => ({ ...current, teacherId: offering?.TeacherID || 0, roomId: offering?.RoomID || 0 })); }}>{eligible.map(offering => <Picker.Item key={offering.ID} value={offering.ID} label={`${offering.Class?.ClassCode} · ${offering.Semester?.Name}`} />)}</Picker></View>
      <Text style={styles.body}>GV: {target?.Teacher?.User?.FullName || "Chưa phân công"} · Phòng: {target?.Room?.Name || "Chưa xếp"}</Text>{target?.Schedules?.map(lesson => <Text key={lesson.ID} style={styles.body}>{lesson.FullDate ? academicDate(lesson.FullDate) : lesson.DayOfWeek} · {lesson.StartTime}–{lesson.EndTime}</Text>)}
      <View style={styles.toggle}><Switch value={editSchedule} onValueChange={setEditSchedule} disabled={busy} /><Text style={[styles.body, { flex: 1 }]}>Bổ sung lịch, giảng viên và phòng học</Text></View>
      {editSchedule && <><Text style={styles.body}>Lịch dùng chung cho cả lớp học phần. Hệ thống kiểm tra trùng giờ trước khi lưu.</Text><Text style={styles.name}>Giảng viên</Text><View style={styles.select}><Picker enabled={!busy} selectedValue={draft.teacherId} onValueChange={value => setDraft(current => ({ ...current, teacherId: Number(value) }))}><Picker.Item label="Chọn giảng viên" value={0} />{teachers.filter(teacher => teacher.MajorID === target?.Class?.MajorID).map(teacher => <Picker.Item key={teacher.ID} label={teacher.User?.FullName || teacher.TeacherCode} value={teacher.ID} />)}</Picker></View><Text style={styles.name}>Phòng học</Text><View style={styles.select}><Picker enabled={!busy} selectedValue={draft.roomId} onValueChange={value => setDraft(current => ({ ...current, roomId: Number(value) }))}><Picker.Item label="Chọn phòng" value={0} />{rooms.map(room => <Picker.Item key={room.ID} label={room.Name} value={room.ID} />)}</Picker></View>{([ ["dates", "Ngày học (YYYY-MM-DD, cách nhau dấu phẩy)", "2026-11-02, 2026-11-04"], ["startTime", "Giờ bắt đầu (HH:mm)", "07:30"], ["endTime", "Giờ kết thúc (HH:mm)", "11:30"] ] as const).map(([field, label, placeholder]) => <View key={field} style={{ gap: 8 }}><Text style={styles.body}>{label}</Text><Input accessibilityLabel={label} editable={!busy} style={styles.input} placeholder={placeholder} placeholderTextColor="#64748B" value={draft[field]} onChangeText={value => setDraft(current => ({ ...current, [field]: value }))} /></View>)}</>}
      <Button style={styles.button} disabled={busy || !target} onPress={saveSchedule}><Text style={styles.white}>{busy ? "Đang lưu…" : "Lưu và xếp lịch cho sinh viên"}</Text></Button>
    </ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#F0F6FF" }, header: { padding: 18, backgroundColor: "white", gap: 14 }, title: { fontSize: 24, fontWeight: "800", color: "#123963" }, tools: { padding: 18, gap: 14 }, body: { color: "#536982", fontSize: 14, lineHeight: 22 }, name: { fontSize: 17, color: "#123963", fontWeight: "700" }, link: { color: "#2563EB", fontWeight: "600", fontSize: 13 }, input: { padding: 14, backgroundColor: "white", borderWidth: 1, borderColor: "#B5CEEF", borderRadius: 12, color: "#123963" }, chip: { padding: 12, borderRadius: 24, backgroundColor: "white" }, active: { backgroundColor: "#2563EB" }, white: { color: "white", fontWeight: "600" }, error: { color: "#B42318" }, list: { padding: 18, gap: 16, paddingBottom: 40 }, card: { borderRadius: 18, padding: 18, backgroundColor: "white", gap: 10 }, button: { padding: 15, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center" }, select: { backgroundColor: "white", borderRadius: 12, borderWidth: 1, borderColor: "#B5CEEF" }, toggle: { flexDirection: "row", gap: 12, alignItems: "center" } });
