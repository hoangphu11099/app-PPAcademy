import { GlowTouchableOpacity as TouchableOpacity } from "@/src/components/GlowTouchableOpacity";
import { GlowTextInput as TextInput } from "@/src/components/GlowTextInput";
import React, { useRef, useState } from "react";
import { Linking, StyleSheet, Switch, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { publicClient, publicError } from "../api/publicApi";
import type { Program } from "../content/programs";
import type { SiteSettings } from "../content/publicWebsite";

const initial = { fullName: "", phone: "", email: "", location: "", preferredSession: "", message: "", consent: false };
export function ConsultationForm({ program, settings }: { program: Program; settings: SiteSettings }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submit = async () => {
    if (sending.current) return;
    const phone = form.phone.replace(/[\s().-]/g, "");
    if (form.fullName.trim().length < 2 || !/^\+?\d{9,15}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !form.location || !form.preferredSession || !form.consent) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại, email hợp lệ, chọn hình thức, khung giờ và đồng ý cho nhà trường liên hệ."); return;
    }
    sending.current = true; setBusy(true); setError("");
    try {
      const { data } = await publicClient.post("/public/consultations", { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone, program: program.name, website: "" });
      setSuccess(`${data.message} · Mã đăng ký #${data.reference}`); setForm(initial);
    } catch (reason) { setError(publicError(reason)); }
    finally { sending.current = false; setBusy(false); }
  };
  return <View style={styles.panel}><Text style={styles.title}>Đăng ký tư vấn nhanh</Text><Text style={styles.body}>Tìm hiểu ngành {program.name} cùng {settings.schoolName}.</Text>
    <TouchableOpacity onPress={() => Linking.openURL(`tel:${settings.phone.replace(/[^+0-9]/g, "")}`).catch(() => setError("Không mở được ứng dụng gọi điện."))}><Text style={styles.link}>{settings.phone}</Text></TouchableOpacity>
    {success ? <><Text accessibilityRole="alert" style={styles.body}>{success}</Text><TouchableOpacity onPress={() => setSuccess("")}><Text style={styles.link}>Gửi đăng ký khác</Text></TouchableOpacity></> : <>
      {([ ["fullName", "Họ và tên *", "default", 120], ["phone", "Số điện thoại *", "phone-pad", 30], ["email", "Email *", "email-address", 254] ] as const).map(([key, label, keyboardType, maxLength]) => <View key={key}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} editable={!busy} style={styles.input} value={form[key]} onChangeText={value => setForm(current => ({ ...current, [key]: value }))} keyboardType={keyboardType} autoCapitalize={key === "fullName" ? "words" : "none"} maxLength={maxLength} /></View>)}
      <Text style={styles.label}>Địa điểm / Hình thức quan tâm *</Text><View style={styles.select}><Picker enabled={!busy} selectedValue={form.location} onValueChange={location => setForm(current => ({ ...current, location }))} style={styles.picker}><Picker.Item label="Chọn nhu cầu của bạn" value="" /><Picker.Item label={`Trực tiếp · ${settings.address}`} value={settings.address} /><Picker.Item label="Quan tâm học online" value="Online" /><Picker.Item label="Cần tư vấn thêm về địa điểm" value="Cần tư vấn địa điểm" /></Picker></View>
      <Text style={styles.label}>Thời gian học mong muốn *</Text><View style={styles.select}><Picker enabled={!busy} selectedValue={form.preferredSession} onValueChange={preferredSession => setForm(current => ({ ...current, preferredSession }))} style={styles.picker}><Picker.Item label="Chọn khung thời gian" value="" />{["Sáng", "Chiều", "Tối", "Linh hoạt"].map(value => <Picker.Item key={value} label={value === "Chiều" ? "Trưa / Chiều" : value} value={value} />)}</Picker></View>
      <Text style={styles.label}>Bạn muốn được tư vấn thêm điều gì?</Text><TextInput accessibilityLabel="Nội dung tư vấn" editable={!busy} style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} multiline maxLength={2000} value={form.message} onChangeText={message => setForm(current => ({ ...current, message }))} />
      <View style={styles.consent}><Switch accessibilityLabel="Đồng ý để nhà trường lưu thông tin và liên hệ tư vấn" disabled={busy} value={form.consent} onValueChange={consent => setForm(current => ({ ...current, consent }))} trackColor={{ true: "#1764C0" }} /><Text style={[styles.body, { flex: 1 }]}>Tôi đồng ý để {settings.schoolName} lưu thông tin đăng ký và liên hệ tư vấn ngành học đã chọn.</Text></View>
      <Text style={styles.body}>Khung giờ và hình thức đã chọn là nguyện vọng tư vấn, chưa phải xác nhận mở lớp.</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: "#B42318" }}>{error}</Text> : null}
      <TouchableOpacity disabled={busy} style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit}><Text style={styles.buttonText}>{busy ? "Đang gửi đăng ký…" : "Gửi đăng ký tư vấn →"}</Text></TouchableOpacity>
    </>}
  </View>;
}
const styles = StyleSheet.create({ panel: { padding: 20, borderRadius: 18, backgroundColor: "#F0F6FF", gap: 14 }, title: { color: "#123963", fontSize: 25, fontWeight: "700" }, body: { color: "#536982", fontSize: 14, lineHeight: 22 }, label: { color: "#123963", fontWeight: "600", marginBottom: 8 }, input: { backgroundColor: "white", color: "#123963", borderWidth: 1, borderColor: "#B5CEEF", padding: 14, borderRadius: 12 }, select: { borderWidth: 1, borderColor: "#B5CEEF", borderRadius: 12, backgroundColor: "white" }, picker: { color: "#123963" }, consent: { flexDirection: "row", alignItems: "center", gap: 10 }, link: { color: "#1764C0", fontWeight: "600" }, button: { backgroundColor: "#1764C0", padding: 15, borderRadius: 25, alignItems: "center" }, buttonText: { color: "white", fontWeight: "700" } });
