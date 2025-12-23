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
    <View className="mt-6 pt-6 border-t border-gray-100">
      <Text className="text-lg font-bold mb-4">Comments ({comments.length})</Text>

      {/* New comment */}
      {user && (
        <View className="flex-row items-center mb-5">
          <View className="w-8 h-8 bg-blue-500 rounded-full mr-2 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {user.username?.[0]?.toUpperCase()}
            </Text>
          </View>

          <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex-row">
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1"
            />
            {newComment.trim() && (
              <TouchableOpacity onPress={handleSubmit}>
                {submitting ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <MaterialIcons name="send" size={18} color="#2563EB" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Comment list */}
      <ScrollView>
        {comments.map((comment) => (
          <View key={comment.id} className="mb-4">
            <View className="flex-row">
              <View className="w-8 h-8 bg-blue-500 rounded-full mr-2 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {comment.username?.[0]?.toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <View className="bg-gray-100 rounded-2xl p-3">
                  <Text className="font-semibold text-sm">{comment.username}</Text>
                  <Text>{comment.comment}</Text>
                </View>

                <View className="flex-row items-center ml-2 mt-1">
                  <Text className="text-xs text-gray-500 mr-3">
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
                    className="flex-row items-center"
                  >
                    <Text className="mr-1">
                      {comment.user_reaction ? REACTION_ICONS[comment.user_reaction] : "👍"}
                    </Text>
                    <Text className="text-xs font-semibold text-gray-600">
                      {comment.user_reaction ? REACTION_LABELS[comment.user_reaction] : "Like"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Reaction Picker */}
      <Modal transparent visible={!!reactionTarget} animationType="none">
        <AnimatePresence>
          {reactionTarget && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 120 }}
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
            >
              <Pressable className="absolute inset-0" onPress={() => setReactionTarget(null)} />

              <MotiView
                from={{ translateY: 10, scale: 0.95 }}
                animate={{ translateY: 0, scale: 1 }}
                transition={{ duration: 160 }}
                className="bg-white px-3 py-2 rounded-full flex-row shadow-2xl"
              >
                {REACTION_TYPES.map((type, idx) => {
                  const active = reactionTarget.currentReaction === type;

                  return (
                    <MotiView
                      key={type}
                      from={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 120,
                        delay: idx * 25,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleCommentReaction(reactionTarget.commentId, type)}
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
