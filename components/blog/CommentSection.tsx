import { useAuth } from "@/libs/hooks/useAuthen";
import { useAppDispatch } from "@/libs/stores";
import { contentEngagementThunk, postEngagementThunk } from "@/libs/stores/engagementManager/thunk";
import { EngagementSummary } from "@/libs/types/engagement";
import { MaterialIcons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { REACTION_ICONS, REACTION_LABELS, REACTION_TYPES } from "./ReactionButton";

interface CommentSectionProps {
  contentId: string;
  comments: any[];
  onCommentsUpdate: (summary: EngagementSummary) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  comments,
  onCommentsUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  /** 🔑 FIX: lưu comment + reaction khi mở picker */
  const [reactionTarget, setReactionTarget] = useState<{
    commentId: string;
    currentReaction?: string;
  } | null>(null);

  /* ---------------- COMMENT CRUD ---------------- */

  const refresh = async () => {
    const updated = await dispatch(contentEngagementThunk(contentId)).unwrap();
    onCommentsUpdate(updated);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);

    try {
      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: { action: "add_comment", comment_text: newComment },
        }),
      ).unwrap();
      setNewComment("");
      await refresh();
    } catch {
      Alert.alert("Error", "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(
              postEngagementThunk({
                id: contentId,
                req: { action: "delete_comment", comment_id: commentId },
              }),
            ).unwrap();
            await refresh();
          } catch {
            Alert.alert("Error", "Failed to delete comment");
          }
        },
      },
    ]);
  };

  const saveEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action: "edit_comment",
            comment_id: commentId,
            comment_text: editText,
          },
        }),
      ).unwrap();
      setEditingId(null);
      await refresh();
    } catch {
      Alert.alert("Error", "Failed to update comment");
    }
  };

  /* ---------------- COMMENT REACTION (FIXED) ---------------- */

  const handleCommentReaction = async (commentId: string, selectedType: string) => {
    if (!user) return;

    const isRemoving = reactionTarget?.currentReaction === selectedType;

    setReactionTarget(null);

    try {
      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action: isRemoving ? "remove_comment_reaction" : "add_comment_reaction",
            comment_id: commentId,
            reaction_type: isRemoving ? undefined : selectedType,
          },
        }),
      ).unwrap();

      await refresh();
    } catch {
      Alert.alert("Error", "Failed to update reaction");
    }
  };

  const handleDefaultReaction = (comment: any) => {
    setReactionTarget({
      commentId: comment.id,
      currentReaction: comment.user_reaction,
    });

    handleCommentReaction(comment.id, comment.user_reaction || "LIKE");
  };

  /* ---------------- UI HELPERS ---------------- */

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 36e5);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  /* ---------------- RENDER ---------------- */

  return (
    <View className="mt-4 pt-4 border-t border-gray-200">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</Text>

      {/* New comment */}
      {user && (
        <View className="flex-row items-start mb-6 px-2">
          <View className="w-8 h-8 bg-rose-500 rounded-full mr-3 items-center justify-center">
            <Text className="text-white text-xs font-semibold">
              {user.username?.[0]?.toUpperCase()}
            </Text>
          </View>

          <View className="flex-1 bg-gray-50 rounded-full px-4 py-3 flex-row items-center border border-gray-200">
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1 text-gray-900"
              placeholderTextColor="#9CA3AF"
              multiline
              style={{ maxHeight: 100 }}
            />
            {newComment.trim() && (
              <TouchableOpacity onPress={handleSubmit} className="ml-2">
                {submitting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <MaterialIcons name="send" size={20} color="#ef4444" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Comment list */}
      <ScrollView className="px-2">
        {comments.map((comment) => (
          <View key={comment.id} className="mb-4">
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-gray-400 rounded-full mr-3 items-center justify-center">
                <Text className="text-white text-xs font-semibold">
                  {comment.username?.[0]?.toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <View className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Text className="font-semibold text-sm text-gray-900 mb-1">
                    {comment.username}
                  </Text>
                  <Text className="text-gray-800 leading-5">{comment.comment}</Text>
                </View>

                <View className="flex-row items-center ml-4 mt-2">
                  <Text className="text-xs text-gray-500 mr-4">
                    {getTimeAgo(comment.created_at)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleDefaultReaction(comment)}
                    onLongPress={() =>
                      setReactionTarget({
                        commentId: comment.id,
                        currentReaction: comment.user_reaction,
                      })
                    }
                    className="flex-row items-center py-1 px-2 rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Text className="mr-1 text-base">
                      {comment.user_reaction ? REACTION_ICONS[comment.user_reaction] : "👍"}
                    </Text>
                    <Text
                      className={`text-xs font-medium ${
                        comment.user_reaction ? "text-rose-600" : "text-gray-600"
                      }`}
                    >
                      {comment.user_reaction ? REACTION_LABELS[comment.user_reaction] : "Like"}
                    </Text>
                  </TouchableOpacity>

                  {/* Show reaction count if any */}
                  {comment.reactions &&
                    Object.values(comment.reactions).some((count: any) => count > 0) && (
                      <View className="flex-row items-center ml-3">
                        {Object.entries(comment.reactions).map(([type, count]: [string, any]) =>
                          count > 0 ? (
                            <View key={type} className="flex-row items-center mr-2">
                              <Text className="text-xs">{REACTION_ICONS[type]}</Text>
                              <Text className="text-xs text-gray-500 ml-1">{count}</Text>
                            </View>
                          ) : null,
                        )}
                      </View>
                    )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Reaction Picker Modal */}
      <Modal transparent visible={!!reactionTarget} animationType="none">
        <AnimatePresence>
          {reactionTarget && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 150 }}
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <Pressable className="absolute inset-0" onPress={() => setReactionTarget(null)} />

              <MotiView
                from={{ translateY: 20, scale: 0.9, opacity: 0 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                exit={{ translateY: 20, scale: 0.9, opacity: 0 }}
                transition={{ duration: 200, type: "timing" }}
                className="bg-white px-4 py-3 rounded-full flex-row shadow-xl border border-gray-200"
                style={{ elevation: 10 }}
              >
                {REACTION_TYPES.map((type, idx) => {
                  const active = reactionTarget.currentReaction === type;

                  return (
                    <MotiView
                      key={type}
                      from={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 180,
                        delay: idx * 30,
                        type: "timing",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleCommentReaction(reactionTarget.commentId, type)}
                        className="w-12 h-12 items-center justify-center mx-1"
                        activeOpacity={0.7}
                      >
                        <MotiView
                          animate={{
                            scale: active ? 1.4 : 1,
                            translateY: active ? -8 : 0,
                          }}
                          transition={{
                            type: "spring",
                            damping: 12,
                            stiffness: 200,
                          }}
                        >
                          <Text className="text-3xl">{REACTION_ICONS[type]}</Text>
                        </MotiView>
                        {active && (
                          <View className="absolute -bottom-1 w-8 h-1 bg-rose-500 rounded-full" />
                        )}
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
