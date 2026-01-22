import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  // Placeholder data
  const sessions = [
    { id: 1, date: "Today", duration: "5 min", completed: true },
    { id: 2, date: "Yesterday", duration: "5 min", completed: true },
    { id: 3, date: "2 days ago", duration: "3 min", completed: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-cloud-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-light text-cloud-800">History</Text>
        <Text className="text-cloud-500 mt-1">Your practice journey</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {sessions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-cloud-400">No sessions yet</Text>
            <Text className="text-cloud-400 mt-1">
              Complete your first daily practice
            </Text>
          </View>
        ) : (
          <View className="space-y-3 py-4">
            {sessions.map((session) => (
              <View
                key={session.id}
                className="bg-white rounded-xl p-4 flex-row items-center"
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                    session.completed ? "bg-sage-100" : "bg-cloud-100"
                  }`}
                >
                  <Text
                    className={
                      session.completed ? "text-sage-600" : "text-cloud-400"
                    }
                  >
                    {session.completed ? "✓" : "○"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-cloud-700 font-medium">
                    {session.date}
                  </Text>
                  <Text className="text-cloud-400 text-sm">
                    {session.duration}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
