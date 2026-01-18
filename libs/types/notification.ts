export interface Notification {
  id: string;
  user_id: string;
  type: string;
  severity: string;
  status: string;
  is_read: boolean;
  delivery_attempts: DeliveryAttempt[];
  recipient_info: RecipientInfo;
  content_data: ContentData;
  platform_config: PlatformConfig;
  error_details: ErrorDetails;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAttempt {
  timestamp: string;
  status: string;
}

export interface RecipientInfo {}

export interface ContentData {
  body?: string;
  title: string;
}

export interface PlatformConfig {}

export interface ErrorDetails {}
