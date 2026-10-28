import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import { GlowTextInput as TextInput } from "@/src/components/GlowTextInput";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { loadPrograms, loadPublicHome, publicImage } from "../api/publicApi";
import { programs as defaults, type Program } from "../content/programs";
import { defaultSiteSettings } from "../content/publicWebsite";
import { ConsultationForm } from "../components/ConsultationForm";
import { SchoolCommunity } from "../components/SchoolCommunity";
import { SchoolLogo } from "../components/SchoolLogo";

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
export default function ProgramsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const [items, setItems] = useState(defaults);
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);
  const [faq, setFaq] = useState(-1);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const contactY = useRef(0);
  const detailY = useRef(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    const [catalog, home] = await Promise.allSettled([loadPrograms(signal), loadPublicHome(signal)]);
    if (signal?.aborted) return;
    if (catalog.status === "fulfilled") setItems(catalog.value.programs);
    if (home.status === "fulfilled") setSettings(home.value.settings);
    setError(catalog.status === "rejected" || home.status === "rejected" || (catalog.status === "fulfilled" && catalog.value.stale) ? "Chưa đồng bộ được toàn bộ nội dung mới nhất. Đang hiển thị dữ liệu đã có." : "");
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]));
  const selected = items.find(p => p.slug === slug);
  const visible = items.filter(p => (group === "Tất cả" || p.group === group) && normalize(`${p.name} ${p.tools.join(" ")}`).includes(normalize(query.trim())));
  const choose = (program: Program) => { setStage(0); setFaq(-1); router.setParams({ slug: program.slug }); scroll.current?.scrollTo({ y: 0 }); };
  const back = () => { if (slug) { router.setParams({ slug: "" }); scroll.current?.scrollTo({ y: 0 }); } else if (router.canGoBack()) router.back(); else router.replace("/"); };
  const card = (program: Program) => <TouchableOpacity key={program.slug} style={styles.card} onPress={() => choose(program)}><Image source={publicImage(program.image)} style={styles.image} /><View style={styles.copy}><Text style={styles.link}>{program.group}</Text><Text style={styles.heading}>{program.name}</Text><Text style={styles.body}>{program.tagline}</Text><Text style={styles.link}>Xem chương trình →</Text></View></TouchableOpacity>;
  return <SafeAreaView style={styles.root}><View style={styles.header}><TouchableOpacity onPress={back}><Text style={styles.link}>← {slug ? "Tất cả ngành học" : "Trang chủ"}</Text></TouchableOpacity><SchoolLogo url={settings.logoUrl} size={42} /></View><ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} colors={["#1764C0"]} />}>
    {error ? <View style={styles.panel}><Text style={styles.body}>{error}</Text><TouchableOpacity onPress={() => void load()}><Text style={styles.link}>Thử lại</Text></TouchableOpacity></View> : null}
    {slug ? selected ? <View style={{ gap: 22 }} onLayout={event => { detailY.current = event.nativeEvent.layout.y; }}>
      <Image source={publicImage(selected.image)} style={[styles.image, { height: 240, borderRadius: 18 }]} /><Text style={styles.link}>{settings.schoolName} / {selected.group}</Text><Text style={styles.title}>{selected.name}</Text><Text style={styles.heading}>{selected.tagline}</Text><Text style={styles.body}>{selected.description}</Text><TouchableOpacity style={styles.button} onPress={() => scroll.current?.scrollTo({ y: detailY.current + contactY.current, animated: true })}><Text style={styles.buttonText}>Tìm hiểu & tư vấn →</Text></TouchableOpacity>
      <View style={styles.panel}><Text style={styles.heading}>Ngành học này có dành cho bạn?</Text>{["Bạn đang chọn ngành: tìm hiểu hướng học phù hợp với sở thích và mục tiêu.", "Bạn muốn học thêm: bổ sung kỹ năng cho các dự án của riêng mình.", "Bạn muốn đổi hướng: khám phá một lĩnh vực mới từ nền tảng hiện có."].map(text => <Text style={styles.body} key={text}>{text}</Text>)}</View>
      <Text style={styles.heading}>Bạn sẽ khám phá những gì?</Text><Text style={styles.body}>Lộ trình tham khảo. Môn học và kế hoạch chính thức được nhà trường tư vấn theo từng chương trình.</Text><View style={styles.filters}>{selected.stages.map((item, i) => <TouchableOpacity key={item.title} style={[styles.chip, stage === i && styles.active]} accessibilityState={{ selected: stage === i }} onPress={() => setStage(i)}><Text style={stage === i ? styles.buttonText : styles.link}>Chặng {i + 1}</Text></TouchableOpacity>)}</View>{selected.stages[stage] && <View style={styles.panel}><Text style={styles.heading}>{selected.stages[stage].title}</Text>{selected.stages[stage].topics.map(text => <Text key={text} style={styles.body}>• {text}</Text>)}<Text style={styles.link}>{selected.tools.join(" / ")}</Text></View>}
      <Text style={styles.heading}>Kỹ năng & chuẩn đầu ra định hướng</Text>{selected.skills.map(text => <Text style={styles.body} key={text}>• {text}</Text>)}<Text style={styles.body}>✓ Hoàn thiện sản phẩm thực hành, trình bày quá trình thực hiện và phối hợp làm việc nhóm.</Text><View style={styles.panel}><Text style={styles.heading}>Dự án gợi ý</Text><Text style={styles.body}>{selected.project}</Text></View><Text style={styles.heading}>Hướng nghề nghiệp</Text>{selected.careers.map(text => <Text key={text} style={styles.body}>• {text}</Text>)}<Text style={styles.body}>Yêu cầu tuyển dụng phụ thuộc vào năng lực, kinh nghiệm và từng doanh nghiệp.</Text>
      <Text style={styles.heading}>Câu hỏi thường gặp</Text>{[["Chưa có kiến thức nền có thể tìm hiểu không?", "Bạn có thể bắt đầu từ nội dung nền tảng. Bộ phận tư vấn sẽ trao đổi về kiến thức hiện tại để hướng dẫn lựa chọn chương trình phù hợp."], ["Thời lượng và học phí là bao nhiêu?", "Thời lượng, học phí và lịch khai giảng được nhà trường xác nhận theo chương trình và đợt học."], ["Đây có phải danh sách môn học chính thức không?", "Đây là phần giới thiệu và lộ trình tham khảo. Đề cương, điều kiện đầu vào và thông tin chứng nhận chính thức được cung cấp khi tư vấn."]].map(([question, answer], i) => <TouchableOpacity key={question} style={styles.panel} accessibilityState={{ expanded: faq === i }} onPress={() => setFaq(faq === i ? -1 : i)}><Text style={styles.link}>{question} {faq === i ? "−" : "+"}</Text>{faq === i && <Text style={styles.body}>{answer}</Text>}</TouchableOpacity>)}
      <View onLayout={event => { contactY.current = event.nativeEvent.layout.y; }}><ConsultationForm key={selected.slug} program={selected} settings={settings} /></View><SchoolCommunity /><Text style={styles.heading}>Có thể bạn cũng quan tâm</Text>{items.filter(p => p.slug !== selected.slug).sort((a, b) => Number(b.group === selected.group) - Number(a.group === selected.group)).slice(0, 3).map(card)}
    </View> : loading ? <ActivityIndicator color="#1764C0" /> : <Text style={styles.heading}>Ngành học chưa có sẵn.</Text> : <><Text style={styles.link}>KHÁM PHÁ HƯỚNG ĐI CỦA BẠN</Text><Text style={styles.title}>Một đam mê.{'\n'}Nhiều hướng phát triển.</Text><TextInput accessibilityLabel="Tìm ngành học" placeholder="Tìm ngành bạn quan tâm…" placeholderTextColor="#64748B" value={query} onChangeText={setQuery} style={styles.input} /><View style={styles.filters}>{["Tất cả", "Công nghệ", "Sáng tạo", "Kinh doanh"].map(item => <TouchableOpacity key={item} onPress={() => setGroup(item)} accessibilityState={{ selected: group === item }} style={[styles.chip, group === item && styles.active]}><Text style={group === item ? styles.buttonText : styles.link}>{item} ({item === "Tất cả" ? items.length : items.filter(p => p.group === item).length})</Text></TouchableOpacity>)}</View><Text style={styles.body}>{visible.length} ngành học</Text>{visible.map(card)}{!visible.length && <TouchableOpacity onPress={() => { setQuery(""); setGroup("Tất cả"); }}><Text style={styles.link}>Chưa tìm thấy ngành phù hợp. Xem tất cả ngành học →</Text></TouchableOpacity>}</>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "white" }, header: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderColor: "#DBE8FA" }, content: { padding: 20, paddingBottom: 40, gap: 18 }, title: { fontSize: 32, fontWeight: "800", color: "#123963" }, heading: { fontSize: 21, fontWeight: "700", color: "#123963" }, body: { color: "#536982", fontSize: 15, lineHeight: 24 }, link: { color: "#1764C0", fontWeight: "600", fontSize: 13 }, card: { borderWidth: 1, borderColor: "#DBE8FA", borderRadius: 18, overflow: "hidden" }, image: { width: "100%", height: 180 }, copy: { padding: 20, gap: 12 }, panel: { backgroundColor: "#F0F6FF", borderRadius: 18, padding: 20, gap: 14 }, filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: "#EAF2FF", padding: 12, borderRadius: 24 }, active: { backgroundColor: "#1764C0" }, input: { padding: 14, borderWidth: 1, borderColor: "#B5CEEF", borderRadius: 12, color: "#123963" }, button: { backgroundColor: "#1764C0", padding: 14, borderRadius: 24, alignSelf: "flex-start" }, buttonText: { color: "white", fontWeight: "700", fontSize: 13 } });
