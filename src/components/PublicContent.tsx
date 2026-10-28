import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { publicImage } from "../api/publicApi";
import type { SchoolPost } from "../content/publicWebsite";

export function PostCards({ posts }: { posts: SchoolPost[] }) {
  const router = useRouter();
  return <View style={{ gap: 16 }}>{posts.map(post => <TouchableOpacity key={post.slug} style={styles.card} onPress={() => router.push({ pathname: "/article", params: { slug: post.slug } })}>
    <Image source={publicImage(post.coverImageUrl || "/pp-academy-campus.webp")} style={styles.image} />
    <View style={styles.copy}><Text style={styles.meta}>{post.id < 0 ? "Câu chuyện minh họa · Nội dung tham khảo" : post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Mới cập nhật"}</Text><Text style={styles.title}>{post.title}</Text><Text style={styles.body}>{post.excerpt}</Text><Text style={styles.link}>Đọc bài viết →</Text></View>
  </TouchableOpacity>)}</View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: "white", borderWidth: 1, borderColor: "#DCE8F8", borderRadius: 18, overflow: "hidden" }, image: { width: "100%", height: 180 }, copy: { padding: 18, gap: 10 }, meta: { color: "#64748B", fontSize: 12 }, title: { fontSize: 19, color: "#123963", fontWeight: "700" }, body: { color: "#536982", fontSize: 14, lineHeight: 22 }, link: { color: "#1764C0", fontWeight: "600" } });
