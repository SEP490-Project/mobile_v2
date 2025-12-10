export interface Notifications {
  id: string;
  user_id: string;
  type: string;
  status: string;
  is_read: boolean;
  delivery_attempts: [
    {
      timestamp: string;
      status: string;
    },
  ];
  recipient_info: object;
  content_data: object;
  platform_config: object;
  error_details: object;
  created_at: string;
  updated_at: string;
}
