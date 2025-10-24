import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Linking, ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

const renderTextNode = (node: any, i: number) => {
  if (!node?.text) return null;
  let textStyle = "text-gray-800";
  let element = (
    <Text key={i} className={textStyle}>
      {node.text}
    </Text>
  );

  if (node.marks) {
    node.marks.forEach((mark: any) => {
      switch (mark.type) {
        case "bold":
          element = (
            <Text key={i} className="font-bold">
              {element}
            </Text>
          );
          break;
        case "italic":
          element = (
            <Text key={i} className="italic">
              {element}
            </Text>
          );
          break;
        case "underline":
          element = (
            <Text key={i} className="underline">
              {element}
            </Text>
          );
          break;
        case "highlight":
          element = (
            <Text key={i} className="bg-yellow-200">
              {element}
            </Text>
          );
          break;
        case "textStyle":
          if (mark.attrs?.color) {
            element = (
              <Text key={i} style={{ color: mark.attrs.color }}>
                {element}
              </Text>
            );
          }
          break;
        case "link":
          element = (
            <Text
              key={i}
              className="text-blue-600 underline"
              onPress={() => Linking.openURL(mark.attrs.href)}
            >
              {element}
            </Text>
          );
          break;
      }
    });
  }

  return element;
};

// 🧩 Recursive Renderer
export const renderTiptapContent = (node: any, key?: number): React.ReactNode => {
  if (!node) return null;

  switch (node.type) {
    case "doc":
      return (
        <ScrollView
          key={key}
          showsVerticalScrollIndicator={false}
          className="bg-white"
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {node.content?.map((child: any, i: number) => (
            <Animated.View key={i} entering={FadeInUp.delay(i * 80)}>
              {renderTiptapContent(child, i)}
            </Animated.View>
          ))}
        </ScrollView>
      );

    case "heading": {
      const level = node.attrs?.level || 1;
      const baseClass = "text-center";
      const classNames =
        level === 1
          ? `${baseClass} text-5xl font-extrabold mt-4 mb-2`
          : level === 2
            ? `${baseClass} text-2xl font-bold mt-4 mb-2`
            : `${baseClass} text-xl font-semibold mt-3 mb-2`;

      return (
        <Text key={key} className={classNames}>
          {node.content?.map((c: any, i: number) => renderTextNode(c, i))}
        </Text>
      );
    }

    case "paragraph": {
      const align = node.attrs?.textAlign || "left";
      return (
        <Text
          key={key}
          className="text-[16px] text-gray-800 leading-7 mb-3"
          style={{ textAlign: align }}
        >
          {node.content?.map((c: any, i: number) => renderTextNode(c, i))}
        </Text>
      );
    }

    case "image":
      return (
        <View key={key} className="my-5">
          <Image
            source={{ uri: node.attrs?.src }}
            style={{
              width: width - 32,
              height: (width - 32) * 0.6,
              borderRadius: 12,
              alignSelf: "center",
            }}
            resizeMode="cover"
          />
          {node.attrs?.title && (
            <Text className="text-gray-500 text-sm italic text-center mt-2">
              {node.attrs.title}
            </Text>
          )}
        </View>
      );

    case "video":
      return (
        <View key={key} className="my-6 rounded-xl overflow-hidden">
          <WebView
            source={{ uri: node.attrs?.src }}
            style={{ width: width - 32, height: (width - 32) * 0.56, borderRadius: 12 }}
            allowsFullscreenVideo
          />
          {node.attrs?.title && (
            <Text className="text-gray-500 text-sm italic text-center mt-2">
              {node.attrs.title}
            </Text>
          )}
        </View>
      );

    case "blockquote":
      return (
        <View key={key} className="border-l-4 border-gray-300 pl-4 my-4">
          <Text className="italic text-gray-600 text-[15px] leading-6">
            {node.content?.map((c: any, i: number) => renderTextNode(c, i))}
          </Text>
        </View>
      );

    case "bulletList":
      return (
        <View key={key} className="mb-3 ml-2">
          {node.content?.map((item: any, i: number) => renderTiptapContent(item, i))}
        </View>
      );

    case "listItem":
      return (
        <View key={key} className="flex-row items-start mb-1">
          <MaterialIcons
            name="fiber-manual-record"
            size={8}
            color="#6B7280"
            style={{ marginTop: 8, marginRight: 8 }}
          />
          <Text className="text-gray-700 flex-1 leading-6">{itemContent(node.content)}</Text>
        </View>
      );

    case "horizontalRule":
      return <View key={key} className="border-t border-gray-200 my-5" />;

    case "codeBlock":
      return (
        <View key={key} className="bg-gray-900 p-3 rounded-lg my-4" style={{ overflow: "hidden" }}>
          <Text className="text-white font-mono text-sm leading-6">
            {node.content?.[0]?.text || ""}
          </Text>
        </View>
      );

    default:
      return null;
  }
};

// helper for list items
const itemContent = (content: any[]) => {
  return content?.map((c) => (c.type === "paragraph" ? c.content?.[0]?.text : "")).join(" ");
};
