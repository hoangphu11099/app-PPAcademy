export const registrationLabels: Record<string, string> = {
  pending_payment: "Chờ đóng học phí", paid: "Đã xác nhận học phí · Chờ xếp lịch", scheduled: "Đã xếp lịch",
  enrolled: "Đang học", registered: "Đã đăng ký (dữ liệu cũ)", cancelled: "Đã hủy",
};
export function academicDate(value?: string) {
  const date = value?.slice(0, 10);
  if (!date || date.startsWith("0001")) return "Chưa cập nhật";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
export function scoreText(value: unknown) {
  if (value === null || value === undefined || value === "") return "Chưa công bố";
  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(1)}/100` : "Chưa công bố";
}

export function scheduleMatchesDate(item: { teachingDate?: string; startDate?: string; endDate?: string }, date: Date) {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (item.teachingDate) return item.teachingDate === key;
  return (!item.startDate || key >= item.startDate) && (!item.endDate || key <= item.endDate);
}
