import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BreathCircle } from "../../components/BreathCircle";

type DailyStep = "welcome" | "breathe" | "speak" | "complete";

export default function Daily() {
  const [step, setStep] = useState<DailyStep>("welcome");
  const [breathingComplete, setBreathingComplete] = useState(false);

  const handleBreathingComplete = () => {
    setBreathingComplete(true);
  };

  const renderWelcome = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-3xl font-light text-cloud-800 text-center">
        Your Daily 5
      </Text>
      <Text className="text-cloud-500 text-center mt-4 mb-8">
        A gentle 5-minute practice to find your voice
      </Text>

      <View className="w-full space-y-3 mb-8">
        <View className="flex-row items-center bg-white rounded-xl p-4">
          <View className="w-8 h-8 rounded-full bg-sage-100 items-center justify-center mr-4">
            <Text className="text-sage-600 font-medium">1</Text>
          </View>
          <Text className="text-cloud-700">Breathing exercise</Text>
        </View>

        <View className="flex-row items-center bg-white rounded-xl p-4">
          <View className="w-8 h-8 rounded-full bg-cloud-100 items-center justify-center mr-4">
            <Text className="text-cloud-500 font-medium">2</Text>
          </View>
          <Text className="text-cloud-500">Speaking practice</Text>
        </View>
      </View>

      <Pressable
        className="w-full bg-cloud-800 py-4 rounded-2xl active:bg-cloud-700"
        onPress={() => setStep("breathe")}
      >
        <Text className="text-white text-center text-lg font-medium">
          Begin
        </Text>
      </Pressable>
    </View>
  );

  const renderBreathe = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-2xl font-light text-cloud-800 mb-2">
        Breathe
      </Text>
      <Text className="text-cloud-500 text-center mb-8">
        Follow the circle to calm your breath
      </Text>

      <BreathCircle
        inhaleSeconds={4}
        holdSeconds={4}
        exhaleSeconds={4}
        cycles={3}
        onComplete={handleBreathingComplete}
      />

      {breathingComplete && (
        <Pressable
          className="w-full bg-sage-500 py-4 rounded-2xl active:bg-sage-600 mt-8"
          onPress={() => setStep("speak")}
        >
          <Text className="text-white text-center text-lg font-medium">
            Continue to Speaking
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderSpeak = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-2xl font-light text-cloud-800 mb-2">
        Speak
      </Text>
      <Text className="text-cloud-500 text-center mb-8">
        Record a short practice session
      </Text>

      <View className="w-32 h-32 rounded-full bg-cloud-100 items-center justify-center mb-8">
        <View className="w-16 h-16 rounded-full bg-cloud-300" />
      </View>

      <Text className="text-cloud-400 text-center mb-8">
        Tap to start recording
      </Text>

      <Pressable
        className="w-full bg-cloud-200 py-4 rounded-2xl active:bg-cloud-300"
        onPress={() => setStep("complete")}
      >
        <Text className="text-cloud-600 text-center text-lg font-medium">
          Skip for now
        </Text>
      </Pressable>
    </View>
  );

  const renderComplete = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="w-24 h-24 rounded-full bg-sage-100 items-center justify-center mb-8">
        <Text className="text-4xl">✓</Text>
      </View>

      <Text className="text-2xl font-light text-cloud-800 mb-2">
        Well done
      </Text>
      <Text className="text-cloud-500 text-center mb-8">
        You've completed your daily practice
      </Text>

      <Pressable
        className="w-full bg-cloud-800 py-4 rounded-2xl active:bg-cloud-700"
        onPress={() => {
          setStep("welcome");
          setBreathingComplete(false);
        }}
      >
        <Text className="text-white text-center text-lg font-medium">
          Done
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud-50">
      {step === "welcome" && renderWelcome()}
      {step === "breathe" && renderBreathe()}
      {step === "speak" && renderSpeak()}
      {step === "complete" && renderComplete()}
    </SafeAreaView>
  );
}
