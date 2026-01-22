import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-cloud-50">
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo/Brand */}
        <View className="mb-12">
          <Text className="text-4xl font-light text-cloud-800 tracking-wide">
            SpeakFlow
          </Text>
          <Text className="text-cloud-500 text-center mt-2">
            Find your voice, effortlessly
          </Text>
        </View>

        {/* Main Actions */}
        <View className="w-full space-y-4">
          <Link href="/login" asChild>
            <Pressable className="w-full bg-cloud-800 py-4 rounded-2xl active:bg-cloud-700">
              <Text className="text-white text-center text-lg font-medium">
                Sign In
              </Text>
            </Pressable>
          </Link>

          <Link href="/register" asChild>
            <Pressable className="w-full bg-cloud-100 py-4 rounded-2xl active:bg-cloud-200">
              <Text className="text-cloud-700 text-center text-lg font-medium">
                Create Account
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Tagline */}
        <Text className="text-cloud-400 text-sm mt-12 text-center">
          Practice speaking with calm, guided exercises
        </Text>
      </View>
    </SafeAreaView>
  );
}
