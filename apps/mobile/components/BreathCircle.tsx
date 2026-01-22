import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";

interface BreathCircleProps {
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  cycles?: number;
  onComplete?: () => void;
}

type Phase = "inhale" | "hold" | "exhale";

export function BreathCircle({
  inhaleSeconds = 4,
  holdSeconds = 4,
  exhaleSeconds = 4,
  cycles = 3,
  onComplete,
}: BreathCircleProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(inhaleSeconds);
  const [isComplete, setIsComplete] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  // Phase durations in ms
  const phaseDurations = {
    inhale: inhaleSeconds * 1000,
    hold: holdSeconds * 1000,
    exhale: exhaleSeconds * 1000,
  };

  // Animate circle based on phase
  useEffect(() => {
    if (!isActive) return;

    if (phase === "inhale") {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: phaseDurations.inhale,
        useNativeDriver: true,
      }).start();
    } else if (phase === "exhale") {
      Animated.timing(scaleAnim, {
        toValue: 0.6,
        duration: phaseDurations.exhale,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, phase]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || isComplete) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, isComplete]);

  // Phase cycling
  useEffect(() => {
    if (!isActive || isComplete) return;

    const currentPhaseDuration = phaseDurations[phase];

    const timer = setTimeout(() => {
      if (phase === "inhale") {
        setPhase("hold");
        setSecondsRemaining(holdSeconds);
      } else if (phase === "hold") {
        setPhase("exhale");
        setSecondsRemaining(exhaleSeconds);
      } else {
        // exhale -> next cycle or complete
        if (currentCycle < cycles) {
          setCurrentCycle((prev) => prev + 1);
          setPhase("inhale");
          setSecondsRemaining(inhaleSeconds);
        } else {
          setIsComplete(true);
          setIsActive(false);
          onComplete?.();
        }
      }
    }, currentPhaseDuration);

    return () => clearTimeout(timer);
  }, [isActive, phase, currentCycle, isComplete]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setCurrentCycle(1);
    setSecondsRemaining(inhaleSeconds);
    setIsComplete(false);
    scaleAnim.setValue(0.6);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "inhale":
        return "Breathe in";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe out";
    }
  };

  return (
    <View className="items-center">
      {/* Circle container */}
      <View className="w-64 h-64 items-center justify-center">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="w-56 h-56 rounded-full bg-cloud-200 items-center justify-center"
        >
          <View className="w-44 h-44 rounded-full bg-cloud-100 items-center justify-center">
            {isActive ? (
              <View className="items-center">
                <Text className="text-cloud-700 text-lg font-light">
                  {getPhaseLabel()}
                </Text>
                <Text className="text-cloud-500 text-4xl font-light mt-2">
                  {secondsRemaining}
                </Text>
              </View>
            ) : isComplete ? (
              <Text className="text-sage-600 text-lg">Complete</Text>
            ) : (
              <Text className="text-cloud-400 text-lg">Ready</Text>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Cycle indicator */}
      {isActive && (
        <Text className="text-cloud-400 mt-4">
          Cycle {currentCycle} of {cycles}
        </Text>
      )}

      {/* Control button */}
      {!isComplete && (
        <Pressable
          className={`mt-6 px-8 py-3 rounded-2xl ${
            isActive
              ? "bg-cloud-200 active:bg-cloud-300"
              : "bg-cloud-800 active:bg-cloud-700"
          }`}
          onPress={isActive ? handleStop : handleStart}
        >
          <Text
            className={`text-lg font-medium ${
              isActive ? "text-cloud-600" : "text-white"
            }`}
          >
            {isActive ? "Pause" : "Start"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
