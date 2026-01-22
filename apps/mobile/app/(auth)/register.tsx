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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      // TODO: Show error toast
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual registration with API
      router.replace("/(app)/daily");
    } catch (error) {
      console.error("Registration failed:", error);
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
              Create account
            </Text>
            <Text className="text-cloud-500 mt-2">
              Start your journey to confident speaking
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

            <View>
              <Text className="text-cloud-600 mb-2 text-sm">Confirm Password</Text>
              <TextInput
                className="w-full bg-white border border-cloud-200 rounded-xl px-4 py-3 text-cloud-800"
                placeholder="••••••••"
                placeholderTextColor="#b4bcc8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Pressable
              className={`w-full py-4 rounded-2xl mt-4 ${
                isLoading ? "bg-cloud-400" : "bg-cloud-800 active:bg-cloud-700"
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-medium">
                {isLoading ? "Creating account..." : "Create Account"}
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-8 flex-row justify-center">
            <Text className="text-cloud-500">Already have an account? </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-cloud-700 font-medium">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
