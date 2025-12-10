// components/ui/tab-bar-background.tsx
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

type TabBarBackgroundProps = {
  style?: object;
};

export function useBottomTabOverflow() {
  // nếu sau này muốn handle overflow (ví dụ tab bar nổi cao hơn) thì chỉnh ở đây
  return 0;
}

export default function TabBarBackground({ style }: TabBarBackgroundProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.96, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 220 }}
      style={[styles.container, style]}
    >
      {Platform.OS !== "web" ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15,15,15,0.92)" }]} />
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 999,
    overflow: "hidden",
  },
});
