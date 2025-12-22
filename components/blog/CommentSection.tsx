import { useAuth } from "@/libs/hooks/useAuthen";
import { useEngagement } from "@/libs/hooks/useEngagement";
import { useAppDispatch } from "@/libs/stores";
import { contentEngagementThunk, postEngagementThunk } from "@/libs/stores/engagementManager/thunk";
import { EngagementSummary } from "@/libs/types/engagement";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
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
  const { loading } = useEngagement();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);

    try {
      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action: "add_comment",
            comment_text: newComment,
          },
        }),
      ).unwrap();

      const updatedEngagement = await dispatch(contentEngagementThunk(contentId)).unwrap();
      onCommentsUpdate(updatedEngagement);
      setNewComment("");
      Alert.alert("Success", "Comment posted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to post comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(
              postEngagementThunk({
                id: contentId,
                req: {
                  action: "delete_comment",
                  comment_id: commentId,
                },
              }),
            ).unwrap();

            const updatedEngagement = await dispatch(contentEngagementThunk(contentId)).unwrap();
            onCommentsUpdate(updatedEngagement);
            Alert.alert("Success", "Comment deleted");
          } catch {
            Alert.alert("Error", "Failed to delete comment");
          }
        },
      },
    ]);
  };

  const showCommentActions = (comment: any) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit Comment", "Delete Comment"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            startEdit(comment);
          } else if (buttonIndex === 2) {
            handleDelete(comment.id);
          }
        },
      );
    } else {
      Alert.alert("Comment Actions", "Choose an action", [
        { text: "Edit Comment", onPress: () => startEdit(comment) },
        { text: "Delete Comment", onPress: () => handleDelete(comment.id), style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const startEdit = (comment: any) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
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

      const updatedEngagement = await dispatch(contentEngagementThunk(contentId)).unwrap();
      onCommentsUpdate(updatedEngagement);
      setEditingId(null);
      Alert.alert("Success", "Comment updated");
    } catch {
      Alert.alert("Error", "Failed to update comment");
    }
  };

  const handleCommentReaction = async (commentId: string, type: string) => {
    if (!user) return;

    setShowReactionPicker(null);
    try {
      const comment = comments.find((c) => c.id === commentId);
      const isRemoving = comment?.user_reaction === type;

      const action = isRemoving ? "remove_comment_reaction" : "add_comment_reaction";

      await dispatch(
        postEngagementThunk({
          id: contentId,
          req: {
            action,
            comment_id: commentId,
            reaction_type: isRemoving ? undefined : type,
          },
        }),
      ).unwrap();

      const updatedEngagement = await dispatch(contentEngagementThunk(contentId)).unwrap();
      onCommentsUpdate(updatedEngagement);
    } catch {
      Alert.alert("Error", "Failed to update reaction");
    }
  };

  const handleDefaultReactionClick = (comment: any) => {
    if (comment.user_reaction) {
      handleCommentReaction(comment.id, comment.user_reaction);
    } else {
      handleCommentReaction(comment.id, "LIKE");
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

  // Chỉ hiển thị khi đã đăng nhập
  if (!user) {
    return null;
  }

  return (
    <View className="mt-8 pt-6 border-t border-gray-100">
      <Text className="text-xl font-bold text-gray-900 mb-6">Comments ({comments.length})</Text>

      {/* Add Comment Form */}
      <View className="mb-6">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-2">
            <Text className="text-white font-semibold text-xs">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>

          <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex-row items-center">
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            {newComment.trim() && (
              <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <MaterialIcons name="send" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Comments List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {comments.map((comment) => (
          <View key={comment.id} className="mb-3">
            <TouchableOpacity
              onLongPress={() =>
                user?.id === comment.user_id && !editingId && showCommentActions(comment)
              }
              activeOpacity={0.9}
              disabled={editingId === comment.id}
            >
              <View className="flex-row">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-semibold text-xs">
                    {comment.username?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>

                <View className="flex-1">
                  {editingId === comment.id ? (
                    <View className="bg-gray-50 rounded-2xl p-3 mb-2">
                      <TextInput
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                        className="text-gray-900 mb-3"
                        style={{ textAlignVertical: "top" }}
                      />
                      <View className="flex-row justify-end space-x-2">
                        <TouchableOpacity
                          onPress={cancelEdit}
                          className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
                        >
                          <Text className="text-gray-700 font-medium">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => saveEdit(comment.id)}
                          className="px-4 py-2 bg-blue-500 rounded-lg"
                        >
                          <Text className="text-white font-medium">Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View className="bg-gray-100 rounded-2xl p-3 mb-1">
                        <Text className="font-semibold text-gray-900 mb-1">{comment.username}</Text>
                        <Text className="text-gray-800">{comment.comment}</Text>
                      </View>

                      {/* Meta Info */}
                      <View className="flex-row items-center ml-3 mb-1">
                        <Text className="text-xs text-gray-500 mr-3">
                          {getTimeAgo(comment.created_at)}
                        </Text>
                        {comment.is_edit && (
                          <Text className="text-xs text-gray-500 mr-3">Edited</Text>
                        )}

                        {/* Like Button */}
                        <TouchableOpacity
                          onPress={() => handleDefaultReactionClick(comment)}
                          onLongPress={() => setShowReactionPicker(comment.id)}
                          className="mr-3"
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              comment.user_reaction ? "text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {comment.user_reaction
                              ? REACTION_LABELS[comment.user_reaction]
                              : "Like"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Reaction Counts Display */}
                      {Object.keys(comment.reactions || {}).length > 0 && (
                        <View className="flex-row items-center ml-3">
                          <View className="bg-white rounded-full px-2 py-1 flex-row items-center shadow-sm">
                            {Object.entries(comment.reactions || {})
                              .slice(0, 3)
                              .map(([type, count]: [string, any], idx) => (
                                <View
                                  key={type}
                                  className="flex-row items-center"
                                  style={{ marginLeft: idx > 0 ? -4 : 0 }}
                                >
                                  <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                                    <Text className="text-xs">{REACTION_ICONS[type]}</Text>
                                  </View>
                                </View>
                              ))}
                            <Text className="text-xs text-gray-600 ml-1 font-medium">
                              {String(
                                Object.values(comment.reactions || {}).reduce(
                                  (a: number, b: any) => a + Number(b),
                                  0,
                                ),
                              )}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(null)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={() => setShowReactionPicker(null)}
        >
          <View className="bg-white rounded-full px-3 py-3 shadow-2xl" style={{ elevation: 10 }}>
            <View className="flex-row items-center space-x-1">
              {REACTION_TYPES.map((type, index) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleCommentReaction(showReactionPicker!, type)}
                  className="w-12 h-12 items-center justify-center active:scale-125"
                  style={{
                    transform: [{ scale: 1 }],
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
