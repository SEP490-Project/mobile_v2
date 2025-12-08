export interface FilePayload {
  userId: string;
  files: File[];
}

export type UploadResponse = Record<string, string[]>;
