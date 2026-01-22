import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Profile() {
  const handleLogout = () => {
    // TODO: Clear auth state
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-light text-cloud-800">Profile</Text>
      </View>

      <View className="flex-1 px-6">
        {/* User Info */}
        <View className="bg-white rounded-xl p-6 mt-4">
          <View className="w-16 h-16 rounded-full bg-cloud-200 items-center justify-center mb-4">
            <Text className="text-2xl text-cloud-500">👤</Text>
          </View>
          <Text className="text-cloud-800 text-lg font-medium">
            user@example.com
          </Text>
          <Text className="text-cloud-400 mt-1">Member since Jan 2026</Text>
        </View>

        {/* Stats */}
        <View className="bg-white rounded-xl p-6 mt-4">
          <Text className="text-cloud-600 font-medium mb-4">Your Progress</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl text-cloud-800 font-light">12</Text>
              <Text className="text-cloud-400 text-sm">Sessions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl text-cloud-800 font-light">5</Text>
              <Text className="text-cloud-400 text-sm">Day streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl text-cloud-800 font-light">1h</Text>
              <Text className="text-cloud-400 text-sm">Total time</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="bg-white rounded-xl mt-4">
          <Pressable className="p-4 flex-row justify-between items-center border-b border-cloud-100">
            <Text className="text-cloud-700">Notifications</Text>
            <Text className="text-cloud-400">→</Text>
          </Pressable>
          <Pressable className="p-4 flex-row justify-between items-center border-b border-cloud-100">
            <Text className="text-cloud-700">Privacy</Text>
            <Text className="text-cloud-400">→</Text>
          </Pressable>
          <Pressable className="p-4 flex-row justify-between items-center">
            <Text className="text-cloud-700">Help & Support</Text>
            <Text className="text-cloud-400">→</Text>
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          className="bg-white rounded-xl p-4 mt-4"
          onPress={handleLogout}
        >
          <Text className="text-center text-warmth-600">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
