import { CommentSection } from "@/components/blog";
import { useAuth } from "@/libs/hooks/useAuthen";
import { useContent } from "@/libs/hooks/useContent";
import { useEngagement } from "@/libs/hooks/useEngagement";
import { useAppDispatch } from "@/libs/stores";
import { contentDetail } from "@/libs/stores/contentManager/thunk";
import { contentEngagementThunk, postEngagementThunk } from "@/libs/stores/engagementManager/thunk";
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
  TouchableWithoutFeedback,
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
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

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

  const onShare = async () => {
    try {
      const url = `https://bshowsell.site/blog/${id}`;
      const result = await Share.share({
        message: `Check out this blog: ${content?.title}\n${url}`,
      });

      if (result.action === Share.sharedAction && id && user) {
        try {
          await dispatch(
            postEngagementThunk({
              id: id,
              req: {
                action: "share",
              },
            }),
          ).unwrap();

          const updatedEngagement = await dispatch(contentEngagementThunk(id)).unwrap();
          setEngagementSummary(updatedEngagement);
        } catch (error) {
          console.error("Error tracking share:", error);
        }
      }
    } catch (error: any) {
      console.error("Error sharing content:", error.message);
    }
  };

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
      <TouchableWithoutFeedback onPress={() => setShowReactions(false)}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {content.thumbnail_url && (
            <Image
              source={{ uri: content.thumbnail_url }}
              className="w-full h-64"
              resizeMode="cover"
            />
          )}

          <View className="px-4">
            <Text className="text-2xl font-bold text-gray-900 mt-4 mb-3">{content.title}</Text>

            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-4">
                  <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {getTimeAgo(content.created_at)}
                  </Text>
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

            {content.blog?.excerpt && (
              <View className="mb-4">
                <Text className="text-lg text-gray-700 leading-7 italic">
                  {content.blog.excerpt}
                </Text>
              </View>
            )}

            {content.blog?.tags && content.blog.tags.length > 0 && (
              <View className="flex-row flex-wrap mb-6">
                {content.blog.tags.map((tag, index) => (
                  <View key={index} className="bg-rose-100 px-3 py-1 rounded-full mr-2 mb-2">
                    <Text className="text-rose-600 text-sm font-medium">{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {content.body && typeof content.body === "object" && (
              <TiptapRenderer content={content.body as any} />
            )}

            {content.affiliate_link && (
              <View className="mt-6 p-4 bg-rose-50 rounded-xl border border-rose-100">
                <Text className="text-rose-800 font-semibold mb-2">Shop Now</Text>
                <TouchableOpacity className="bg-rose-500 py-3 px-6 rounded-lg">
                  <Text className="text-white text-center font-semibold">Visit Store</Text>
                </TouchableOpacity>
              </View>
            )}

            {id && (
              <>
                {/* Action Bar - Facebook Style */}
                <View className="border-t border-gray-200 mt-6">
                  <View className="flex-row items-center py-2">
                    {/* Like Button */}
                    <TouchableOpacity
                      onPress={() => {
                        if (user) {
                          dispatch(
                            postEngagementThunk({
                              id: id,
                              req: { action: "add_reaction", reaction_type: "LIKE" },
                            }),
                          ).then(() => {
                            dispatch(contentEngagementThunk(id)).then((result) => {
                              if (contentEngagementThunk.fulfilled.match(result)) {
                                setEngagementSummary(result.payload);
                              }
                            });
                          });
                        }
                      }}
                      onLongPress={() => setShowReactions(!showReactions)}
                      className="flex-1 flex-row items-center justify-center py-3"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={
                          engagementSummary?.user_engagement?.has_reacted
                            ? "favorite"
                            : "favorite-border"
                        }
                        size={22}
                        color={
                          engagementSummary?.user_engagement?.has_reacted ? "#e91e63" : "#65676b"
                        }
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          engagementSummary?.user_engagement?.has_reacted
                            ? "text-pink-600"
                            : "text-gray-600"
                        }`}
                      >
                        Like
                      </Text>
                    </TouchableOpacity>

                    {/* Comment Button */}
                    <TouchableOpacity
                      onPress={() => setShowComments(!showComments)}
                      className="flex-1 flex-row items-center justify-center py-3"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="mode-comment" size={22} color="#65676b" />
                      <Text className="ml-2 text-gray-600 font-medium">Comment</Text>
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity
                      onPress={onShare}
                      className="flex-1 flex-row items-center justify-center py-3"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="share" size={22} color="#65676b" />
                      <Text className="ml-2 text-gray-600 font-medium">Share</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Reactions Count Bar */}
                  {(engagementSummary?.total_reactions || 0) > 0 ||
                    ((engagementSummary?.total_comments || 0) > 0 && (
                      <View className="flex-row items-center justify-between px-4 py-2 border-t border-gray-100">
                        <View className="flex-row items-center">
                          {(engagementSummary?.total_reactions || 0) > 0 && (
                            <View className="flex-row items-center">
                              <View className="flex-row -space-x-1">
                                {Object.entries(engagementSummary?.reactions_by_type || {}).map(
                                  ([type, count]) =>
                                    count > 0 ? (
                                      <View
                                        key={type}
                                        className="w-5 h-5 rounded-full bg-pink-500 items-center justify-center border border-white"
                                      >
                                        <Text className="text-white text-xs">❤️</Text>
                                      </View>
                                    ) : null,
                                )}
                              </View>
                              <Text className="ml-2 text-gray-500 text-sm">
                                {engagementSummary?.total_reactions}
                              </Text>
                            </View>
                          )}
                        </View>

                        {(engagementSummary?.total_comments || 0) > 0 && (
                          <TouchableOpacity onPress={() => setShowComments(!showComments)}>
                            <Text className="text-gray-500 text-sm">
                              {engagementSummary?.total_comments} comment
                              {engagementSummary?.total_comments !== 1 ? "s" : ""}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                  {/* Reactions Popup - Facebook Style */}
                  {showReactions && (
                    <View className="absolute bottom-full mb-2 left-4 right-4">
                      <View className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
                        <View className="flex-row justify-around items-center">
                          {[
                            {
                              emoji: "👍",
                              action: "add_reaction",
                              reaction_type: "LIKE",
                              color: "#1877f2",
                            },
                            {
                              emoji: "❤️",
                              action: "add_reaction",
                              reaction_type: "LOVE",
                              color: "#e91e63",
                            },
                            {
                              emoji: "😂",
                              action: "add_reaction",
                              reaction_type: "HAHA",
                              color: "#f7b928",
                            },
                            {
                              emoji: "😮",
                              action: "add_reaction",
                              reaction_type: "WOW",
                              color: "#f7b928",
                            },
                            {
                              emoji: "😢",
                              action: "add_reaction",
                              reaction_type: "SAD",
                              color: "#f7b928",
                            },
                            {
                              emoji: "😡",
                              action: "add_reaction",
                              reaction_type: "ANGRY",
                              color: "#e9710f",
                            },
                          ].map((reaction, index) => (
                            <TouchableOpacity
                              key={reaction.reaction_type}
                              onPress={() => {
                                if (user) {
                                  dispatch(
                                    postEngagementThunk({
                                      id: id,
                                      req: {
                                        action: reaction.action,
                                        reaction_type: reaction.reaction_type,
                                      },
                                    }),
                                  ).then(() => {
                                    dispatch(contentEngagementThunk(id)).then((result) => {
                                      if (contentEngagementThunk.fulfilled.match(result)) {
                                        setEngagementSummary(result.payload);
                                      }
                                    });
                                  });
                                }
                                setShowReactions(false);
                              }}
                              className="w-12 h-12 items-center justify-center rounded-full"
                              activeOpacity={0.7}
                              style={{
                                transform: [{ scale: showReactions ? 1 : 0 }],
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              <Text className="text-2xl">{reaction.emoji}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      {/* Triangle pointer */}
                      <View className="items-center">
                        <View
                          className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
                          style={{ marginTop: -1 }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Comment Section - Show only when toggled */}
                {showComments && (
                  <CommentSection
                    contentId={id}
                    comments={engagementSummary?.comments || []}
                    onCommentsUpdate={(summary) => setEngagementSummary(summary)}
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default BlogDetailScreen;
