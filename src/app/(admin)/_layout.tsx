import { interaction } from "../../theme/interaction";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ColorValue, Platform, StyleSheet, View } from "react-native";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIconStyle: { width: 48, height: 34 },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="DashboardAdmin"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={typeof color === "string" ? color : "#9CA3AF"}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "Người dùng",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              color={typeof color === "string" ? color : "#9CA3AF"}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Courses"
        options={{
          title: "Môn học",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "book" : "book-outline"}
              color={typeof color === "string" ? color : "#9CA3AF"}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Báo cáo",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "stats-chart" : "stats-chart-outline"}
              color={typeof color === "string" ? color : "#9CA3AF"}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              color={typeof color === "string" ? color : "#9CA3AF"}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen name="CreateIdStudent" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen
        name="AcademicWarnings"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen
        name="Consultations"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen name="Rooms" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }} />
      <Tabs.Screen name="CourseRegistrations" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }} />
      <Tabs.Screen
        name="StudentDetail"
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" }, headerShown: false }}
      />
      <Tabs.Screen name="AddStudentToClass" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="CreateIdTeacher" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="CreateClass" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="AssignTeacher" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="SendNotification" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="exams" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="NotificationList" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      <Tabs.Screen name="ClassList" options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive, focused && interaction.glow]}>
      <Ionicons name={name} size={22} color={typeof color === "string" ? color : "#9CA3AF"} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    height: Platform.OS === "ios" ? 88 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "#EAF2FF",
  },
});
