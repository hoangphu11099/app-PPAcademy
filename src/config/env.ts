export const env = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.69:8080").replace(/\/$/, ""),
  websiteBaseUrl: (process.env.EXPO_PUBLIC_WEBSITE_URL || "http://192.168.1.69:5173").replace(/\/$/, ""),
};
