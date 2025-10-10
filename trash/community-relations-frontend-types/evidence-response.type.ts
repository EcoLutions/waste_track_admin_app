/**
 * Response DTO for evidence data
 * Corresponds to: EvidenceResource.java
 *
 * @see EvidenceResource.java in backend
 */
export interface EvidenceResponse {
  id: string | null;
  type: string | null;
  originalFileName: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  fileSize: number | null; // Long in backend
  mimeType: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
}