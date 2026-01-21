export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
  THANKFUL = "THANKFUL",
}

export enum EngagementAction {
  ADD_REACTION = "add_reaction",
  REMOVE_REACTION = "remove_reaction",
  ADD_COMMENT = "add_comment",
  EDIT_COMMENT = "edit_comment",
  DELETE_COMMENT = "delete_comment",
  ADD_COMMENT_REACTION = "add_comment_reaction",
  REMOVE_COMMENT_REACTION = "remove_comment_reaction",
  SHARE = "share",
}

export interface EngagementPost {
  action: string;
  comment_id?: string;
  comment_text?: string;
  reaction_type?: string;
}

export interface EngagementSummary {
  total_reactions: number;
  total_shares: number;
  reactions_by_type: Record<string, number>;
  total_comments: number;
  comments: ContentCommentResponse[];
  user_engagement?: UserEngagementStatus;
}

export interface UserEngagementStatus {
  has_reacted: boolean;
  has_shared: boolean;
  has_commented: boolean;
  like_type?: string;
}

export interface ContentCommentResponse {
  id: string;
  comment: string;
  reactions: Record<string, number>;
  created_at: string;
  is_edit: boolean;
  is_censored: boolean;
  user_id: string;
  username: string;
  avatar_url: string;
  user_reaction?: string;
}
