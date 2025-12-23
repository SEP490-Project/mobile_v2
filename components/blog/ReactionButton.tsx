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
import { AnimatePresence, MotiView } from "moti";
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
  const { contentEngagement, userEngagementStatus } = useEngagement();
  const { isAuthenticated, user } = useAuth();

  const [showPicker, setShowPicker] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!contentId) return;
    dispatch(contentEngagementThunk(contentId));
    if (isAuthenticated && user) {
      dispatch(userEngagementStatusThunk(contentId));
    }
  }, [contentId, dispatch, isAuthenticated, user]);

  const handleReaction = async (type: string) => {
    if (processing || !isAuthenticated || !user) return;

    setProcessing(true);
    setShowPicker(false);

    try {
      const isRemoving =
        userEngagementStatus?.has_reacted && userEngagementStatus.like_type === type;

      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action: isRemoving ? "remove_reaction" : "add_reaction",
            reaction_type: isRemoving ? undefined : type,
          },
        }),
      ).unwrap();

      const updated = await dispatch(contentEngagementThunk(contentId)).unwrap();

      dispatch(userEngagementStatusThunk(contentId));
      onSummaryUpdate?.(updated);
    } catch (e) {
      Alert.alert("Error", "Failed to update reaction");
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const currentReaction = userEngagementStatus?.has_reacted
    ? {
        icon: REACTION_ICONS[userEngagementStatus.like_type!],
        label: REACTION_LABELS[userEngagementStatus.like_type!],
      }
    : { icon: "👍", label: "Like" };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View className="py-3 border-t border-gray-200">
      {/* Reaction count */}
      {contentEngagement?.total_reactions ? (
        <View className="px-4 mb-2">
          <View className="flex-row items-center bg-white px-2 py-1 rounded-full shadow-sm self-start">
            {Object.entries(contentEngagement.reactions_by_type || {})
              .slice(0, 3)
              .map(([type], idx) => (
                <View
                  key={type}
                  className="w-5 h-5 items-center justify-center bg-white rounded-full"
                  style={{ marginLeft: idx ? -4 : 0 }}
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

      {/* Like button */}
      <TouchableOpacity
        onPress={() => handleReaction(userEngagementStatus?.like_type || "LIKE")}
        onLongPress={() => setShowPicker(true)}
        disabled={processing}
        className="flex-row items-center justify-center py-2"
      >
        {processing ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <>
            {userEngagementStatus?.has_reacted ? (
              <Text className="text-xl mr-1">{currentReaction.icon}</Text>
            ) : (
              <MaterialIcons name="thumb-up-off-alt" size={20} color="#6B7280" />
            )}
            <Text
              className={`ml-1 text-sm font-semibold ${
                userEngagementStatus?.has_reacted ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {currentReaction.label}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Reaction Picker */}
      <Modal transparent visible={showPicker} animationType="none">
        <AnimatePresence>
          {showPicker && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 100 }}
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
            >
              <Pressable className="absolute inset-0" onPress={() => setShowPicker(false)} />

              <MotiView
                from={{ translateY: 12, scale: 0.95, opacity: 0 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                exit={{ translateY: 8, scale: 0.96, opacity: 0 }}
                transition={{ duration: 160 }}
                className="bg-white px-3 py-2 rounded-full shadow-2xl flex-row"
              >
                {REACTION_TYPES.map((type, index) => {
                  const active = userEngagementStatus?.like_type === type;

                  return (
                    <MotiView
                      key={type}
                      from={{ scale: 0.85, opacity: 0, translateY: 6 }}
                      animate={{ scale: 1, opacity: 1, translateY: 0 }}
                      transition={{
                        duration: 120,
                        delay: index * 25,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleReaction(type)}
                        className="w-12 h-12 items-center justify-center"
                      >
                        <MotiView
                          animate={{
                            scale: active ? 1.35 : 1,
                            translateY: active ? -6 : 0,
                          }}
                          transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 250,
                          }}
                        >
                          <Text className="text-3xl">{REACTION_ICONS[type]}</Text>
                        </MotiView>
                      </TouchableOpacity>
                    </MotiView>
                  );
                })}
              </MotiView>
            </MotiView>
          )}
        </AnimatePresence>
      </Modal>
    </View>
  );
};
