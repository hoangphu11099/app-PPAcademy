import apiClient from "../../api/axios";
import { registrationLabels } from "../../utils/academic";
import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import { GlowTextInput as TextInput } from "@/src/components/GlowTextInput";
import {
  cancelCourseRegistrationAPI,
  getMyCourseRegistrationsAPI,
  getOpenCourseClassesAPI,
  registerCourseAPI,
} from "@/src/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "open" | "mine";

type OpenCourse = {
  courseOfferingId: number;
  classId: number;
  courseId: number;
  classCode: string;
  courseCode: string;
  courseName: string;
  teacherName: string;
  semesterName: string;
  semesterId: number;
  roomName: string;
  maxStudents: number;
  currentStudents: number;
  scheduleText: string;
  credits?: number;
};

type RegisteredItem = {
  enrollmentId: number;
  registrationId?: number;
  courseId: number;
  semesterId: number;
  teacherName: string;
  scheduleText: string;
  courseName: string;
  courseCode: string;
  classCode: string;
  status: string;
  enrollDate?: string;
};

const formatSchedules = (schedules: any[] | undefined): string => {
  if (!Array.isArray(schedules) || schedules.length === 0)
    return "Chưa có lịch";
  return schedules
    .map((s) => {
      const rawDay = String(s.DayOfWeek ?? s.dayOfWeek ?? s.day_of_week ?? "");
      const days: Record<string, string> = { mon: "Thứ Hai", tue: "Thứ Ba", wed: "Thứ Tư", thu: "Thứ Năm", fri: "Thứ Sáu", sat: "Thứ Bảy", sun: "Chủ nhật" };
      const day = days[rawDay.toLowerCase().slice(0, 3)] || rawDay;
      const start = s.StartTime ?? s.startTime ?? s.start_time ?? "";
      const end = s.EndTime ?? s.endTime ?? s.end_time ?? "";
      const session = s.Session ?? s.session ?? "";
      if (start || end) return `${day} ${start}${end ? `-${end}` : ""}`.trim();
      return `${day} ${session}`.trim();
    })
    .filter(Boolean)
    .join(" · ");
};

const RegisterCourses: React.FC = () => {
  const [tab, setTab] = useState<Tab>("open");
  const [openList, setOpenList] = useState<OpenCourse[]>([]);
  const [mine, setMine] = useState<RegisteredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [majorName, setMajorName] = useState("");

  const loadOpen = useCallback(async () => {
    const res = await getOpenCourseClassesAPI();
    setMajorName(String(res.data?.majorName || ""));
    const raw = res.data?.data ?? res.data ?? [];
    const list = (Array.isArray(raw) ? raw : [])
      .map((item: any): OpenCourse | null => {
        const classId = Number(
          item.classId ?? item.ClassID ?? item.class_id ?? 0,
        );
        const courseId = Number(
          item.courseId ?? item.CourseID ?? item.course_id ?? 0,
        );
        if (!classId || !courseId) return null;
        return {
          courseOfferingId: Number(
            item.courseOfferingId ?? item.CourseOfferingID ?? item.id ?? 0,
          ),
          classId,
          courseId,
          classCode: String(item.classCode ?? item.ClassCode ?? ""),
          courseCode: String(item.courseCode ?? item.CourseCode ?? ""),
          courseName: String(item.courseName ?? item.CourseName ?? "Học phần"),
          teacherName: String(item.teacherName ?? item.TeacherName ?? "—"),
          semesterName: String(item.semesterName ?? item.SemesterName ?? ""),
          semesterId: Number(item.semesterId ?? 0),
          roomName: String(item.roomName ?? item.RoomName ?? "—"),
          maxStudents: Number(item.maxStudents ?? item.MaxStudents ?? 0),
          currentStudents: Number(
            item.currentStudents ?? item.CurrentStudents ?? 0,
          ),
          scheduleText: formatSchedules(item.schedules ?? item.Schedules),
          credits: Number(item.credits ?? item.Credits ?? 0) || undefined,
        };
      })
      .filter(Boolean) as OpenCourse[];
    setOpenList(list);
  }, []);

  const loadMine = useCallback(async () => {
    const res = await getMyCourseRegistrationsAPI();
    const requests = Array.isArray(res.data?.requests) ? res.data.requests : [];
    const linked = new Set(requests.map((row: any) => Number(row.EnrollmentID)));
    const enrollments = (Array.isArray(res.data?.data) ? res.data.data : []).filter((row: any) => !linked.has(Number(row.ID)));
    const list: RegisteredItem[] = [...requests.map((row: any) => ({...row, registrationId:row.ID})), ...enrollments].map((row: any) => {
      const offering = row.CourseOffering || {};
      return { registrationId:row.registrationId, enrollmentId:Number(row.registrationId ? row.EnrollmentID || 0 : row.ID), courseId:Number(row.CourseID), semesterId:Number(offering.SemesterID || row.Class?.SemesterID || 0), courseName:row.Course?.Name || "", courseCode:row.Course?.Code || "", classCode:row.Class?.ClassCode || "", status:row.Status || "enrolled", enrollDate:row.RegisteredAt || row.EnrollDate, teacherName:offering.Teacher?.User?.FullName || "", scheduleText:formatSchedules(offering.Schedules) };
    });
    setMine(list);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([loadOpen(), loadMine()]);
    } catch (e: any) {
      setOpenList([]);
      setMajorName("");
      console.log("register load", e?.response?.data || e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || "Không tải được danh sách học phần.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadOpen, loadMine]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAll();
    }, [loadAll]),
  );

  const filteredOpen = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return openList;
    return openList.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.classCode.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q),
    );
  }, [openList, search]);

  const isAlreadyRegistered = (item: OpenCourse) => mine.some(row => row.status !== "cancelled" && row.courseId === item.courseId && row.semesterId === item.semesterId);

  const handleRegister = (item: OpenCourse) => {
    if (item.maxStudents > 0 && item.currentStudents >= item.maxStudents) {
      Alert.alert("Hết chỗ", "Lớp học phần đã đủ sĩ số.");
      return;
    }
    if (isAlreadyRegistered(item)) {
      Alert.alert("Đã đăng ký", "Bạn đã đăng ký môn học này rồi.");
      return;
    }

    Alert.alert(
      "Xác nhận đăng ký",
      `${item.courseCode} — ${item.courseName}\nLớp: ${item.classCode}\nGV: ${item.teacherName}\nLịch: ${item.scheduleText}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng ký",
          onPress: async () => {
            setSubmittingId(item.courseOfferingId || item.classId);
            try {
              const result = await registerCourseAPI({
                courseOfferingId: item.courseOfferingId,
                classId: item.classId,
                courseId: item.courseId,
              });
              Alert.alert("Đăng ký thành công", result.data?.message || "Đã đăng ký học phần thành công. Vui lòng liên hệ học vụ để đóng học phí.");
              await loadAll();
              setTab("mine");
            } catch (e: any) {
              const d = e?.response?.data;
              Alert.alert(
                "Đăng ký thất bại",
                [d?.message, d?.error].filter(Boolean).join("\n") ||
                  "Không thể đăng ký. Kiểm tra học kỳ đang mở / lịch học phần.",
              );
            } finally {
              setSubmittingId(null);
            }
          },
        },
      ],
    );
  };

  const handleCancel = (item: RegisteredItem) => {
    Alert.alert("Hủy đăng ký", `Hủy ${item.courseName}?`, [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đăng ký",
        style: "destructive",
        onPress: async () => {
          try {
            if (item.registrationId && item.status === "pending_payment") await apiClient.delete(`/course-registration-requests/${item.registrationId}`);
            else await cancelCourseRegistrationAPI(item.enrollmentId);
            Alert.alert("Thành công", "Đã hủy học phần.");
            await loadAll();
          } catch (e: any) {
            const d = e?.response?.data;
            Alert.alert(
              "Lỗi",
              [d?.message, d?.error].filter(Boolean).join("\n") ||
                "Hủy thất bại.",
            );
          }
        },
      },
    ]);
  };

  const renderOpenItem = ({ item }: { item: OpenCourse }) => {
    const full =
      item.maxStudents > 0 && item.currentStudents >= item.maxStudents;
    const registered = isAlreadyRegistered(item);
    const busy =
      submittingId === item.courseOfferingId || submittingId === item.classId;

    return (
      <View style={styles.card}>
        <Text style={styles.code}>
          {item.courseCode} · {item.classCode}
        </Text>
        <Text style={styles.name}>{item.courseName}</Text>
        <Text style={styles.meta}>Giảng viên: {item.teacherName}</Text>
        <Text style={styles.meta}>Phòng: {item.roomName}</Text>
        <Text style={styles.meta}>Lịch: {item.scheduleText}</Text>
        {!!item.semesterName && (
          <Text style={styles.meta}>Học kỳ: {item.semesterName}</Text>
        )}
        <Text style={styles.slots}>
          Sĩ số: {item.currentStudents}
          {item.maxStudents ? `/${item.maxStudents}` : ""}
          {full ? " (đủ)" : ""}
        </Text>

        <TouchableOpacity
          style={[
            styles.btn,
            (full || registered || busy) && styles.btnDisabled,
          ]}
          disabled={full || registered || busy}
          onPress={() => handleRegister(item)}
          activeOpacity={0.8}>
          {busy ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>
              {registered ? "Đã đăng ký" : full ? "Hết chỗ" : "Đăng ký"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderMineItem = ({ item }: { item: RegisteredItem }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>
            {item.courseCode}
            {item.classCode ? ` · ${item.classCode}` : ""}
          </Text>
          <Text style={styles.name}>{item.courseName}</Text>
          <Text style={styles.meta}>Trạng thái: {registrationLabels[item.status] || item.status}</Text>
          {item.status === "pending_payment" && <Text style={styles.meta}>Vui lòng liên hệ học vụ để đóng học phí.</Text>}
          {item.status === "paid" && <Text style={styles.meta}>Học vụ đã xác nhận học phí. Lịch học sẽ hiện sau khi được xếp lớp.</Text>}
          {item.status === "scheduled" && <><Text style={styles.meta}>GV: {item.teacherName || "Chưa cập nhật"}</Text><Text style={styles.meta}>Lịch: {item.scheduleText}</Text></>}
        </View>
        <View style={[styles.badge, ["paid", "scheduled"].includes(item.status) && styles.badgeSuccess]}>
          <Text style={[styles.badgeText, ["paid", "scheduled"].includes(item.status) && styles.badgeSuccessText]}>{registrationLabels[item.status] || "Đã đăng ký"}</Text>
        </View>
      </View>
      {(item.status === "pending_payment" || (item.enrollmentId > 0 && ["enrolled", "registered"].includes(item.status))) && <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => handleCancel(item)}>
        <Text style={styles.cancelText}>Hủy đăng ký</Text>
      </TouchableOpacity>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Đăng ký học phần</Text>
        {!!majorName && <Text style={styles.meta}>Chuyên ngành: {majorName}</Text>}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity selected={Boolean(tab === "open")}
          style={[styles.tab, tab === "open" && styles.tabOn]}
          onPress={() => setTab("open")}>
          <Text style={[styles.tabText, tab === "open" && styles.tabTextOn]}>
            Đang mở ({openList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity selected={Boolean(tab === "mine")}
          style={[styles.tab, tab === "mine" && styles.tabOn]}
          onPress={() => setTab("mine")}>
          <Text style={[styles.tabText, tab === "mine" && styles.tabTextOn]}>
            Đã đăng ký ({mine.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "open" && (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm học phần, lớp hoặc giảng viên"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={tab === "open" ? filteredOpen : (mine as any)}
          keyExtractor={(item: any) =>
            tab === "open"
              ? `o-${item.courseOfferingId}`
              : `m-${item.registrationId ? "request" : "enrollment"}-${item.registrationId || item.enrollmentId}`
          }
          renderItem={tab === "open" ? renderOpenItem : (renderMineItem as any)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAll();
              }}
              colors={["#2563EB"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === "open"
                ? "Chưa có học phần đang mở phù hợp với chuyên ngành của bạn."
                : "Bạn chưa đăng ký học phần nào."}
            </Text>
          }
          ListHeaderComponent={
            tab === "open" ? (
              <Text style={styles.hint}>
                Sau khi đăng ký, vui lòng liên hệ Phòng Học vụ để hoàn tất học phí. Lịch học sẽ được cập nhật sau khi xác nhận thanh toán.
              </Text>
            ) : undefined
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterCourses;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F8FF" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  tabs: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#EAF2FF",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabOn: { backgroundColor: "#2563EB" },
  tabText: { fontWeight: "700", color: "#2563EB", fontSize: 13 },
  tabTextOn: { color: "#FFF" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
    paddingHorizontal: 24,
  },
  hint: {
    fontSize: 12.5,
    color: "#2563EB",
    backgroundColor: "#EAF2FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  code: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  name: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginTop: 4 },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  slots: { fontSize: 12, fontWeight: "600", color: "#374151", marginTop: 8 },
  btn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#94B8EF" },
  btnText: { color: "#FFF", fontWeight: "700" },
  rowBetween: { flexDirection: "row", alignItems: "flex-start" },
  badge: {
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#2563EB", fontWeight: "700", fontSize: 12 },
  badgeSuccess: { backgroundColor: "#D1FAE5" },
  badgeSuccessText: { color: "#059669" },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelText: { color: "#EF4444", fontWeight: "700" },
});
