import React from "react";
import { Image, Text, View } from "react-native";

interface TiptapNode {
  type: string;
  attrs?: any;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: any }[];
}

interface TiptapRendererProps {
  content: TiptapNode;
}

const TiptapRenderer: React.FC<TiptapRendererProps> = ({ content }) => {
  const renderNode = (node: TiptapNode, index: number = 0): React.ReactNode => {
    const key = `${node.type}-${index}`;

    switch (node.type) {
      case "doc":
        return <View key={key}>{node.content?.map((child, i) => renderNode(child, i))}</View>;

      case "paragraph":
        return (
          <Text key={key} className="text-gray-800 text-base leading-6 mb-3">
            {node.content?.map((child, i) => renderNode(child, i))}
          </Text>
        );

      case "text":
        let textStyle = "text-gray-800";
        if (node.marks) {
          node.marks.forEach((mark) => {
            switch (mark.type) {
              case "bold":
                textStyle += " font-bold";
                break;
              case "italic":
                textStyle += " italic";
                break;
              case "underline":
                textStyle += " underline";
                break;
            }
          });
        }
        return (
          <Text key={key} className={textStyle}>
            {node.text}
          </Text>
        );

      case "heading":
        const level = node.attrs?.level || 1;
        let headingStyle = "font-bold text-gray-900 mb-2 mt-4";

        switch (level) {
          case 1:
            headingStyle += " text-2xl";
            break;
          case 2:
            headingStyle += " text-xl";
            break;
          case 3:
            headingStyle += " text-lg";
            break;
          default:
            headingStyle += " text-base";
        }

        return (
          <Text key={key} className={headingStyle}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </Text>
        );

      case "image":
        return (
          <View key={key} className="my-4">
            <Image
              source={{ uri: node.attrs?.src }}
              className="w-full h-48 rounded-lg"
              resizeMode="cover"
            />
            {node.attrs?.alt && (
              <Text className="text-sm text-gray-500 mt-1 text-center italic">
                {node.attrs.alt}
              </Text>
            )}
          </View>
        );

      case "bulletList":
        return (
          <View key={key} className="mb-3">
            {node.content?.map((listItem, i) => (
              <View key={i} className="flex-row mb-1">
                <Text className="text-gray-800 mr-2">•</Text>
                <View className="flex-1">
                  {listItem.content?.map((child, j) => renderNode(child, j))}
                </View>
              </View>
            ))}
          </View>
        );

      case "orderedList":
        const start = node.attrs?.start || 1;
        return (
          <View key={key} className="mb-3">
            {node.content?.map((listItem, i) => (
              <View key={i} className="flex-row mb-1">
                <Text className="text-gray-800 mr-2">{start + i}.</Text>
                <View className="flex-1">
                  {listItem.content?.map((child, j) => renderNode(child, j))}
                </View>
              </View>
            ))}
          </View>
        );

      case "listItem":
        return <View key={key}>{node.content?.map((child, i) => renderNode(child, i))}</View>;

      case "blockquote":
        return (
          <View
            key={key}
            className="border-l-4 border-rose-300 pl-4 py-2 bg-rose-50 rounded-r-lg my-3"
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </View>
        );

      case "hardBreak":
        return <Text key={key}>{"\n"}</Text>;

      default:
        // For unknown node types, try to render content if it exists
        if (node.content) {
          return <View key={key}>{node.content.map((child, i) => renderNode(child, i))}</View>;
        }
        return null;
    }
  };

  return <View>{renderNode(content)}</View>;
};

export default TiptapRenderer;
