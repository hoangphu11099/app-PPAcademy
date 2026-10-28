import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { publicClient, publicImage } from "../api/publicApi";
import { samplePosts } from "../content/publicContent";
import type { SchoolPost } from "../content/publicWebsite";
import { PostCards } from "./PublicContent";

type Faculty = { id: number; name: string; major: string; qualification: string; biography?: string; avatarUrl?: string };
export function SchoolCommunity() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [stories, setStories] = useState<SchoolPost[]>(samplePosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      publicClient.get("/public/faculty", { signal: controller.signal }),
      publicClient.get("/public/posts", { signal: controller.signal }),
    ]).then(([teachers, posts]) => {
      if (controller.signal.aborted) return;
      setError(teachers.status === "rejected");
      if (teachers.status === "fulfilled") { setFaculty(Array.isArray(teachers.value.data.data) ? teachers.value.data.data : []); setPage(0); }
      if (posts.status === "fulfilled") { const rows = (Array.isArray(posts.value.data.data) ? posts.value.data.data : []) as SchoolPost[]; const published = rows.filter(post => post.category === "student"); setStories(published.length ? published : samplePosts); }
      setLoading(false);
    });
    return () => controller.abort();
  }, [retry]);
  return <View style={{ gap: 18 }}><Text style={{ fontSize: 25, fontWeight: "700", color: "#123963" }}>Đội ngũ giảng viên</Text>
    {loading ? <ActivityIndicator color="#1764C0" /> : error ? <TouchableOpacity onPress={() => { setLoading(true); setRetry(n => n + 1); }}><Text style={{ color: "#1764C0" }}>Chưa tải được thông tin giảng viên. Thử lại</Text></TouchableOpacity> : !faculty.length ? <Text>Hồ sơ giảng viên đang được cập nhật.</Text> : <>{faculty.slice(page * 3, page * 3 + 3).map(teacher => <View key={teacher.id} style={{ padding: 20, gap: 10, borderRadius: 18, backgroundColor: "#F0F6FF" }}>{teacher.avatarUrl ? <Image source={publicImage(teacher.avatarUrl)} style={{ width: 80, height: 80, borderRadius: 40 }} /> : null}<Text style={{ fontSize: 19, fontWeight: "700", color: "#123963" }}>{teacher.name}</Text><Text style={{ color: "#1764C0" }}>{teacher.major || "Chuyên môn đang cập nhật"}</Text><Text>{teacher.qualification}</Text><Text style={{ lineHeight: 23, color: "#536982" }}>{teacher.biography || `${teacher.name} là giảng viên${teacher.major ? ` thuộc chuyên ngành ${teacher.major}` : ""} tại PP Academy.`}</Text></View>)}{faculty.length > 3 && <View style={{ flexDirection: "row", justifyContent: "space-between" }}><TouchableOpacity disabled={!page} onPress={() => setPage(p => p - 1)}><Text style={{ color: page ? "#1764C0" : "#94A3B8" }}>← Trang trước</Text></TouchableOpacity><Text>{page + 1}/{Math.ceil(faculty.length / 3)}</Text><TouchableOpacity disabled={(page + 1) * 3 >= faculty.length} onPress={() => setPage(p => p + 1)}><Text style={{ color: (page + 1) * 3 < faculty.length ? "#1764C0" : "#94A3B8" }}>Trang sau →</Text></TouchableOpacity></View>}</>}
    <Text style={{ fontSize: 25, fontWeight: "700", color: "#123963" }}>Câu chuyện sinh viên</Text><PostCards posts={stories.slice(0, 2)} />
  </View>;
}
