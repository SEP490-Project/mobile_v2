// TiptapVideoNode.tsx
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import React from "react";
import { Dimensions, Text, View } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  src: string;
  title?: string;
};

export const TiptapVideoNode: React.FC<Props> = ({ src, title }) => {
  const source: VideoSource = { uri: src, contentType: "hls" };

  const player = useVideoPlayer(source, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <View className="my-6 rounded-xl overflow-hidden">
      <VideoView
        style={{ width: width - 32, height: (width - 32) * 0.56 }}
        player={player}
        nativeControls
        allowsFullscreen
      />
      {title && <Text className="text-gray-500 text-sm italic text-center mt-2">{title}</Text>}
    </View>
  );
};
