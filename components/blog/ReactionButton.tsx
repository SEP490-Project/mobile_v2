import { useAuth } from "@/libs/hooks/useAuthen";
import { useEngagement } from "@/libs/hooks/useEngagement";
import { useAppDispatch } from "@/libs/stores";
import {
  contentEngagementThunk,
  postEngagementThunk,
  userEngagementStatusThunk,
} from "@/libs/stores/engagementManager/thunk";
import { EngagementSummary } from "@/libs/types/engagement";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ReactionButtonProps {
  contentId: string;
  onSummaryUpdate?: (summary: EngagementSummary) => void;
}

export const REACTION_ICONS: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
  THANKFUL: "🙏",
};

export const REACTION_LABELS: Record<string, string> = {
  LIKE: "Like",
  LOVE: "Love",
  HAHA: "Haha",
  WOW: "Wow",
  SAD: "Sad",
  ANGRY: "Angry",
  THANKFUL: "Thankful",
};

export const REACTION_TYPES = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY", "THANKFUL"];

export const ReactionButton: React.FC<ReactionButtonProps> = ({ contentId, onSummaryUpdate }) => {
  const dispatch = useAppDispatch();
  const { contentEngagement, userEngagementStatus, loading } = useEngagement();
  const { isAuthenticated, user } = useAuth();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [processingReaction, setProcessingReaction] = useState(false);

  useEffect(() => {
    if (contentId) {
      dispatch(contentEngagementThunk(contentId));
      if (isAuthenticated && user) {
        dispatch(userEngagementStatusThunk(contentId));
      }
    }
  }, [contentId, dispatch, isAuthenticated, user]);

  const handleReaction = async (type: string) => {
    if (processingReaction || !isAuthenticated || !user) return;

    setProcessingReaction(true);
    setShowReactionPicker(false);

    try {
      // If clicking the same reaction, remove it
      const isRemoving =
        userEngagementStatus?.has_reacted && userEngagementStatus.like_type === type;
      const action = isRemoving ? "remove_reaction" : "add_reaction";

      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action,
            reaction_type: isRemoving ? undefined : type,
          },
        }),
      ).unwrap();

      // Refresh data after action
      const updatedEngagement = await dispatch(contentEngagementThunk(contentId)).unwrap();
      if (isAuthenticated && user) {
        await dispatch(userEngagementStatusThunk(contentId));
      }

      onSummaryUpdate?.(updatedEngagement);
    } catch (error) {
      Alert.alert("Error", "Failed to update reaction");
      console.error(error);
    } finally {
      setProcessingReaction(false);
    }
  };

  const handleDefaultClick = () => {
    if (userEngagementStatus?.has_reacted) {
      handleReaction(userEngagementStatus.like_type || "LIKE");
    } else {
      handleReaction("LIKE");
    }
  };

  const getCurrentReaction = () => {
    if (userEngagementStatus?.has_reacted && userEngagementStatus.like_type) {
      return {
        icon: REACTION_ICONS[userEngagementStatus.like_type],
        label: REACTION_LABELS[userEngagementStatus.like_type],
      };
    }
    return { icon: "👍", label: "Like" };
  };

  const currentReaction = getCurrentReaction();

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated || !user) {
    return (
      <View className="py-3 border-t border-gray-200 my-4">
        <View className="px-4">
          {contentEngagement?.total_reactions && contentEngagement.total_reactions > 0 ? (
            <View className="flex-row items-center mb-3">
              <View className="bg-white rounded-full px-2 py-1 flex-row items-center shadow-sm">
                {Object.entries(contentEngagement.reactions_by_type || {})
                  .slice(0, 3)
                  .map(([type, count]: [string, any], idx) => (
                    <View
                      key={type}
                      className="w-5 h-5 rounded-full bg-white items-center justify-center"
                      style={{ marginLeft: idx > 0 ? -4 : 0 }}
                    >
                      <Text className="text-xs">{REACTION_ICONS[type]}</Text>
                    </View>
                  ))}
                <Text className="text-xs text-gray-600 ml-2 font-medium">
                  {contentEngagement.total_reactions}
                </Text>
              </View>
            </View>
          ) : null}
          <View className="border-t border-gray-200 pt-1">
            <Text className="text-xs text-gray-400 text-center">Login to react</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="py-3 border-t border-gray-200 my-4">
      {/* Reaction Summary */}
      {contentEngagement?.total_reactions && contentEngagement.total_reactions > 0 ? (
        <View className="flex-row items-center px-4 mb-3">
          <View className="bg-white rounded-full px-2 py-1 flex-row items-center shadow-sm">
            {Object.entries(contentEngagement.reactions_by_type || {})
              .slice(0, 3)
              .map(([type, count]: [string, any], idx) => (
                <View
                  key={type}
                  className="w-5 h-5 rounded-full bg-white items-center justify-center"
                  style={{ marginLeft: idx > 0 ? -4 : 0 }}
                >
                  <Text className="text-xs">{REACTION_ICONS[type]}</Text>
                </View>
              ))}
            <Text className="text-xs text-gray-600 ml-2 font-medium">
              {contentEngagement.total_reactions}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View className="border-t border-gray-200 pt-1 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleDefaultClick}
            onLongPress={() => setShowReactionPicker(true)}
            className="flex-1 flex-row items-center justify-center py-2"
            disabled={processingReaction}
          >
            {processingReaction ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <>
                {userEngagementStatus?.has_reacted ? (
                  <Text className="text-xl mr-1">{currentReaction.icon}</Text>
                ) : (
                  <MaterialIcons name="thumb-up-off-alt" size={20} color="#6B7280" />
                )}
                <Text
                  className={`font-semibold text-sm ml-1 ${
                    userEngagementStatus?.has_reacted ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {userEngagementStatus?.has_reacted ? currentReaction.label : "Like"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={() => setShowReactionPicker(false)}
        >
          <View className="bg-white rounded-full px-3 py-3 shadow-2xl" style={{ elevation: 10 }}>
            <View className="flex-row items-center space-x-1">
              {REACTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleReaction(type)}
                  className="w-12 h-12 items-center justify-center active:scale-125"
                  disabled={processingReaction}
                  style={{
                    transform: [{ scale: userEngagementStatus?.like_type === type ? 1.1 : 1 }],
                  }}
                >
                  <Text
                    className="text-3xl"
                    style={{
                      textShadowColor: "rgba(0,0,0,0.1)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {REACTION_ICONS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
