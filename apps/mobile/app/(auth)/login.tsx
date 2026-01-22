import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login with API
      // For now, just navigate to the app
      router.replace("/(app)/daily");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
          {/* Back button */}
          <Link href="/" asChild>
            <Pressable className="absolute top-4 left-4 p-2">
              <Text className="text-cloud-500 text-lg">← Back</Text>
            </Pressable>
          </Link>

          {/* Header */}
          <View className="mb-10">
            <Text className="text-3xl font-light text-cloud-800">
              Welcome back
            </Text>
            <Text className="text-cloud-500 mt-2">
              Sign in to continue your practice
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-cloud-600 mb-2 text-sm">Email</Text>
              <TextInput
                className="w-full bg-white border border-cloud-200 rounded-xl px-4 py-3 text-cloud-800"
                placeholder="you@example.com"
                placeholderTextColor="#b4bcc8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-cloud-600 mb-2 text-sm">Password</Text>
              <TextInput
                className="w-full bg-white border border-cloud-200 rounded-xl px-4 py-3 text-cloud-800"
                placeholder="••••••••"
                placeholderTextColor="#b4bcc8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              className={`w-full py-4 rounded-2xl mt-4 ${
                isLoading ? "bg-cloud-400" : "bg-cloud-800 active:bg-cloud-700"
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-medium">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-cloud-500">Don't have an account? </Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-cloud-700 font-medium">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
