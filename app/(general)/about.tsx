import aboutData from "@/data/about.json";
import { renderTiptapContent } from "@/libs/utils/tiptap/renderTiptapContent";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutUsScreen() {
  return <SafeAreaView className="flex-1 bg-white">{renderTiptapContent(aboutData)}</SafeAreaView>;
}
