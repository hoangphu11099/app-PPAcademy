import { create, isAxiosError } from "axios";
import { env } from "../config/env";
import { mergePrograms, type Program } from "../content/programs";
import { normalizeSiteSettings, type SchoolPost } from "../content/publicWebsite";

// Public calls intentionally do not attach a saved account token.
export const publicClient = create({ baseURL: env.apiBaseUrl, timeout: 15000 });

export async function loadPublicHome(signal?: AbortSignal) {
  const { data } = await publicClient.get("/public/home", { signal });
  if (!data.data?.settings || !Array.isArray(data.data?.posts)) throw new Error("Nội dung trang chủ không hợp lệ");
  return { settings: normalizeSiteSettings(data.data.settings), posts: data.data.posts as SchoolPost[] };
}

export async function loadPrograms(signal?: AbortSignal) {
  const results = await Promise.allSettled([
    publicClient.get("/public/programs", { signal }),
    publicClient.get("/public/program-images", { signal }),
  ]);
  const [content, images] = results;
  const overrides: Program[] = content.status === "fulfilled" && Array.isArray(content.value.data.data) ? content.value.data.data : [];
  const rows: { slug: string; imageUrl: string }[] = images.status === "fulfilled" && Array.isArray(images.value.data.data) ? images.value.data.data : [];
  return {
    programs: mergePrograms(overrides, Object.fromEntries(rows.map(row => [row.slug, row.imageUrl]))).filter(p => p.published !== false),
    stale: results.some(result => result.status === "rejected"),
  };
}

const bundled: Record<string, number> = {
  "/pp-academy-logo.png": require("../assets/brand/pp-academy-logo.png"),
  "/pp-academy-campus.webp": require("../assets/brand/pp-academy-campus.webp"),
  "/pp-academy-library.webp": require("../assets/brand/pp-academy-library.webp"),
  "/pp-academy-tech-lab.webp": require("../assets/brand/pp-academy-tech-lab.webp"),
};

export function publicImage(path: string) {
  if (bundled[path]) return bundled[path];
  return { uri: /^https?:\/\//i.test(path) ? path : `${env.websiteBaseUrl}/${path.replace(/^\//, "")}` };
}

export function publicError(error: unknown) {
  if (isAxiosError(error)) return error.response?.data?.message || "Chưa kết nối được nhà trường. Vui lòng thử lại.";
  return error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.";
}
