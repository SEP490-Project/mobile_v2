import { CommentSection, ReactionButton } from "@/components/blog";
import { useAuth } from "@/libs/hooks/useAuthen";
import { useContent } from "@/libs/hooks/useContent";
import { useEngagement } from "@/libs/hooks/useEngagement";
import { useAppDispatch } from "@/libs/stores";
import { contentDetail } from "@/libs/stores/contentManager/thunk";
import { contentEngagementThunk } from "@/libs/stores/engagementManager/thunk";
import { EngagementSummary } from "@/libs/types/engagement";
import TiptapRenderer from "@/libs/utils/tiptap/renderTiptapContent";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function BlogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { content, loading } = useContent();
  const { contentEngagement } = useEngagement();
  const { user } = useAuth();
  const [engagementSummary, setEngagementSummary] = useState<EngagementSummary | null>(null);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: content?.title ?? "",
      headerTitleAlign: "center",

      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
      ),

      headerRight: () =>
        content ? (
          <TouchableOpacity onPress={onShare} style={{ marginRight: 12 }}>
            <MaterialIcons name="share" size={24} color="#ff9fb2" />
          </TouchableOpacity>
        ) : null,
    });
  }, [content]);

  useEffect(() => {
    if (id) {
      dispatch(contentDetail(id));
      dispatch(contentEngagementThunk(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (contentEngagement) {
      setEngagementSummary(contentEngagement);
    }
  }, [contentEngagement]);

  // Share blog link
  const onShare = async () => {
    try {
      const url = `https://bshowsell.site/blog/${id}`;
      await Share.share({
        message: `Check out this blog: ${content?.title}\n${url}`,
      });
    } catch (error: any) {
      console.error("Error sharing content:", error.message);
    }
  };

  // Calculate time ago from created_at
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}H ago`;
    if (diffInDays < 7) return `${diffInDays}D ago`;
    return `${Math.floor(diffInDays / 7)}W ago`;
  };

  if (loading || !content) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff9fb2" />
          <Text className="text-gray-500 mt-2">Loading blog content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Featured Image */}
        {content.thumbnail_url && (
          <Image
            source={{ uri: content.thumbnail_url }}
            className="w-full h-64"
            resizeMode="cover"
          />
        )}

        <View className="px-4">
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mt-4 mb-3">{content.title}</Text>

          {/* Meta Information */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1">{getTimeAgo(content.created_at)}</Text>
              </View>
              {content.blog?.read_time && (
                <View className="flex-row items-center">
                  <MaterialIcons name="menu-book" size={16} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {content.blog.read_time} min read
                  </Text>
                </View>
              )}
            </View>

            {content.blog?.author && (
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-rose-100 rounded-full items-center justify-center mr-2">
                  <Text className="text-rose-600 font-semibold text-xs">
                    {content.blog.author.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm font-medium">
                  {content.blog.author.username}
                </Text>
              </View>
            )}
          </View>

          {/* Excerpt */}
          {content.blog?.excerpt && (
            <View className="mb-4">
              <Text className="text-lg text-gray-700 leading-7 italic">{content.blog.excerpt}</Text>
            </View>
          )}

          {/* Tags */}
          {content.blog?.tags && content.blog.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-6">
              {content.blog.tags.map((tag, index) => (
                <View key={index} className="bg-rose-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-rose-600 text-sm font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Content Body */}
          {content.body && typeof content.body === "object" && (
            <TiptapRenderer content={content.body as any} />
          )}

          {/* Affiliate Link */}
          {content.affiliate_link && (
            <View className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100">
              <Text className="text-rose-800 font-semibold mb-2">Shop Now</Text>
              <TouchableOpacity className="bg-rose-500 py-3 px-6 rounded-lg">
                <Text className="text-white text-center font-semibold">Visit Store</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Engagement Section */}
          {id && (
            <>
              <ReactionButton
                contentId={id}
                onSummaryUpdate={(summary) => setEngagementSummary(summary)}
              />

              {!user && (
                <View className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                  <View className="items-center">
                    <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center mb-4">
                      <MaterialIcons name="login" size={24} color="white" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 mb-2">
                      Join the conversation
                    </Text>
                    <Text className="text-gray-600 text-center mb-4 leading-5">
                      Login to react to this post and share your thoughts with the community
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-full shadow-lg"
                    >
                      <Text className="text-white font-semibold">Login Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <CommentSection
                contentId={id}
                comments={engagementSummary?.comments || []}
                onCommentsUpdate={(summary) => setEngagementSummary(summary)}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default BlogDetailScreen;
