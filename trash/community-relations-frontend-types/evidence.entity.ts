/**
 * Evidence domain entity for frontend
 * Based on: Evidence.java (DDD Entity)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see Evidence.java in backend
 */
export interface EvidenceEntity {
  id: string;
  type: EvidenceTypeEnum;
  filePath: string;
  originalFileName: string;
  description: string | null;
  fileSize: number; // Long in backend
  mimeType: string;
  thumbnailUrl: string | null;
}