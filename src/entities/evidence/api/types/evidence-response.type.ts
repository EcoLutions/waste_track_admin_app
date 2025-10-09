export interface EvidenceResponse {
  id: string | null;
  type: string | null;
  filePath: string | null;
  originalFileName: string | null;
  description: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
