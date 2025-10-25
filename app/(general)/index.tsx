import faqs from "@/data/faq.json";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-3 bg-gray-50 rounded-xl p-4 shadow-sm">
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row justify-between items-center"
      >
        <Text className="font-semibold text-gray-800 text-base flex-1">{question}</Text>
        <MotiView
          animate={{ rotate: open ? "180deg" : "0deg" }}
          transition={{ type: "timing", duration: 250 }}
        >
          <Text>⌄</Text>
        </MotiView>
      </TouchableOpacity>

      <MotiView
        from={{ opacity: 0, height: 0 }}
        animate={{ opacity: open ? 1 : 0, height: open ? "auto" : 0 }}
        transition={{ type: "timing", duration: 300 }}
        style={{ overflow: "hidden" }}
      >
        <Text className="text-gray-600 mt-3 mb-2 leading-5">{answer}</Text>
      </MotiView>
    </View>
  );
};

function FAQScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  if (!ready) {
    // 🌀 Loading animation
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <ActivityIndicator size="large" color="#ff9fb2" />
          <Text className="text-gray-500 mt-3 text-base font-medium">
            Đang tải câu hỏi thường gặp...
          </Text>
        </MotiView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-4 text-center mt-4">
          Support Center
        </Text>
        <Text className="text-gray-600 mb-6 text-center">
          Find answers to common questions about your account, orders, and shopping experience.
        </Text>

        {faqs.map((group, index) => (
          <View key={index} className="mb-6">
            <Text className="text-xl font-semibold text-primary mb-3">{group.category}</Text>
            {group.items.map((item, i) => (
              <FAQItem key={`${index}-${i}`} {...item} />
            ))}
          </View>
        ))}

        <View className="mt-6 border-t border-gray-200 pt-6">
          <Text className="text-center text-gray-500 text-sm">
            Can&apos;t find what you&apos;re looking for? Reach out to our dedicated support team
            via
          </Text>
          <Text className="text-center text-primary font-semibold mt-1">support@example.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default FAQScreen;
