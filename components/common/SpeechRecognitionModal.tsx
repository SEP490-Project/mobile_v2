import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface SpeechRecognitionModalProps {
  visible: boolean;
  isRecording: boolean;
  recognizedText: string;
  onClose: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const SpeechRecognitionModal: React.FC<SpeechRecognitionModalProps> = ({
  visible,
  isRecording,
  recognizedText,
  onClose,
  onStartRecording,
  onStopRecording,
}) => {
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const micScale = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const lottieRef = useRef<LottieView>(null);
  const micLoop = useRef<Animated.CompositeAnimation | null>(null);
  const ringLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      duration: visible ? 0 : 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      micLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(micScale, {
            toValue: 1.15,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(micScale, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
      micLoop.current.start();

      ringScale.setValue(0);
      ringOpacity.setValue(0.6);

      ringLoop.current = Animated.loop(
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      ringLoop.current.start();

      lottieRef.current?.play();
    } else {
      micLoop.current?.stop();
      ringLoop.current?.stop();
      micLoop.current = null;
      ringLoop.current = null;

      Animated.timing(micScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      lottieRef.current?.reset();
    }

    return () => {
      micLoop.current?.stop();
      ringLoop.current?.stop();
    };
  }, [isRecording]);

  const toggleRecording = () => {
    isRecording ? onStopRecording() : onStartRecording();
  };

  const closeModal = () => {
    if (isRecording) onStopRecording();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeModal}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            <SafeAreaView>
              <Animated.View
                style={{ transform: [{ translateY: slideY }] }}
                className="bg-white rounded-t-3xl px-6 pt-5 pb-7"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-bold text-gray-900">Voice Search</Text>
                  <TouchableOpacity onPress={closeModal} className="p-2 rounded-full bg-gray-100">
                    <MaterialIcons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View className="items-center my-6">
                  {isRecording && (
                    <Animated.View
                      style={{
                        opacity: ringOpacity,
                        transform: [
                          {
                            scale: ringScale.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.8],
                            }),
                          },
                        ],
                      }}
                      className="absolute w-[220px] h-[220px] rounded-full border-[3px] border-emerald-500"
                    />
                  )}

                  {!isRecording && (
                    <TouchableOpacity
                      onPress={toggleRecording}
                      activeOpacity={0.9}
                      className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center"
                    >
                      <Animated.View style={{ transform: [{ scale: micScale }] }}>
                        <MaterialIcons name="mic-none" size={38} color="#6B7280" />
                      </Animated.View>
                    </TouchableOpacity>
                  )}

                  {isRecording && (
                    <TouchableOpacity onPress={toggleRecording} activeOpacity={0.9}>
                      <LottieView
                        ref={lottieRef}
                        source={require("@/assets/mic_wave.json")}
                        autoPlay
                        loop
                        style={{ width: 176, height: 176 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="items-center">
                  <Text className="text-lg font-bold text-gray-900">
                    {isRecording ? "Listening…" : "Tap to start speaking"}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1 text-center">
                    {isRecording
                      ? "Speak now or tap the wave to stop"
                      : "Use your voice to search faster"}
                  </Text>
                </View>

                {!!recognizedText && !isRecording && (
                  <View className="mt-5 items-center">
                    <Text className="text-base text-gray-900 text-center">{recognizedText}</Text>

                    <TouchableOpacity onPress={onStartRecording} className="mt-4">
                      <Text className="text-sm font-semibold text-red-600">Try again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
