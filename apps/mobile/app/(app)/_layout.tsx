import { Tabs } from "expo-router";
import { View, Text } from "react-native";

// Simple icon components
function DailyIcon({ focused }: { focused: boolean }) {
  return (
    <View className={`w-6 h-6 rounded-full ${focused ? "bg-cloud-700" : "bg-cloud-300"}`} />
  );
}

function HistoryIcon({ focused }: { focused: boolean }) {
  return (
    <View className={`w-6 h-6 rounded ${focused ? "bg-cloud-700" : "bg-cloud-300"}`} />
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  return (
    <View className={`w-6 h-6 rounded-full border-2 ${focused ? "border-cloud-700" : "border-cloud-300"}`} />
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fafbfc",
          borderTopColor: "#e9ecf0",
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: "#525c69",
        tabBarInactiveTintColor: "#b4bcc8",
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="daily"
        options={{
          title: "Daily",
          tabBarIcon: ({ focused }) => <DailyIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => <HistoryIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
