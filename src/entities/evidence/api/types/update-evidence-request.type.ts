export interface UpdateEvidenceRequest {
  evidenceId: string | null;
  type: string | null;
  filePath: string | null;
  originalFileName: string | null;
  description: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
}
