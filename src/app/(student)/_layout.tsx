import { interaction } from "../../theme/interaction";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIconStyle: { width: 48, height: 34 },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="DashboardStudent"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <View style={[{ width: 40, height: 32, borderRadius: 14, alignItems: "center", justifyContent: "center" }, focused && interaction.selected, focused && interaction.glow]}><Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={typeof color === "string" ? color : "#9CA3AF"}
            /></View>
          ),
        }}
      />

      <Tabs.Screen
        name="ViewSchedule"
        options={{
          title: "Lịch",
          tabBarIcon: ({ color, focused }) => (
            <View style={[{ width: 40, height: 32, borderRadius: 14, alignItems: "center", justifyContent: "center" }, focused && interaction.selected, focused && interaction.glow]}><Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={typeof color === "string" ? color : "#9CA3AF"}
            /></View>
          ),
        }}
      />

      <Tabs.Screen
        name="RegisterCourses"
        options={{
          title: "Đăng ký",
          tabBarIcon: ({ color, focused }) => (
            <View style={[{ width: 40, height: 32, borderRadius: 14, alignItems: "center", justifyContent: "center" }, focused && interaction.selected, focused && interaction.glow]}><Ionicons
              name={focused ? "school" : "school-outline"}
              size={24}
              color={typeof color === "string" ? color : "#9CA3AF"}
            /></View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => (
            <View style={[{ width: 40, height: 32, borderRadius: 14, alignItems: "center", justifyContent: "center" }, focused && interaction.selected, focused && interaction.glow]}><Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={typeof color === "string" ? color : "#9CA3AF"}
            /></View>
          ),
        }}
      />

      <Tabs.Screen
        name="AcademicWarnings"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen
        name="notification"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false, title: "Thông báo" }}
      />
      <Tabs.Screen
        name="QrAttendance"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen
        name="StudentSubmissions"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen
        name="StudentExercises"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen
        name="ViewTranscript"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
    </Tabs>
  );
}
