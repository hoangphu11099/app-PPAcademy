import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { publicClient, publicError, publicImage } from "../api/publicApi";
import { samplePosts } from "../content/publicContent";
import type { SchoolPost } from "../content/publicWebsite";

export default function Article() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ArticleContent key={slug} slug={slug || ""} />;
}

function ArticleContent({ slug }: { slug: string }) {
  const router = useRouter();
  const sample = samplePosts.find(p => p.slug === slug);
  const [post, setPost] = useState<SchoolPost | undefined>(sample);
  const [loading, setLoading] = useState(!sample);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (sample) return;
    publicClient.get(`/public/posts/${encodeURIComponent(slug || "")}`, { signal: controller.signal }).then(({ data }) => {
      if (!data.data?.slug) throw new Error("Bài viết chưa có sẵn.");
      setPost(data.data);
    }).catch(reason => { if (!controller.signal.aborted) setError(publicError(reason)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug, retry, sample]);
  return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}><TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={{ padding: 20 }}><Text style={{ color: "#1764C0" }}>← Quay lại</Text></TouchableOpacity><ScrollView contentContainerStyle={{ padding: 22, gap: 20 }}>{loading ? <ActivityIndicator color="#1764C0" /> : error ? <><Text>{error}</Text><TouchableOpacity onPress={() => { setLoading(true); setError(""); setRetry(n => n + 1); }}><Text style={{ color: "#1764C0" }}>Thử lại</Text></TouchableOpacity></> : post && <><Text style={{ color: "#1764C0" }}>{post.id < 0 ? "Câu chuyện minh họa · Nội dung tham khảo" : post.category === "student" ? "Góc sinh viên" : "Tin tức nhà trường"}</Text><Text style={{ fontSize: 30, fontWeight: "700", color: "#123963" }}>{post.title}</Text><Text style={{ color: "#64748B" }}>{post.authorName}{post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString("vi-VN")}` : ""}</Text>{post.coverImageUrl && <Image source={publicImage(post.coverImageUrl)} style={{ width: "100%", height: 240, borderRadius: 16 }} />}{post.content.split(/\n+/).filter(Boolean).map((paragraph, i) => <Text key={i} style={{ color: "#334D6C", fontSize: 16, lineHeight: 27 }}>{paragraph}</Text>)}</>}</ScrollView></SafeAreaView>;
}
