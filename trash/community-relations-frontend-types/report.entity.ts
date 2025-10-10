/**
 * Report domain entity for frontend
 * Based on: Report.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see Report.java in backend
 */
export interface ReportEntity {
  id: string;
  citizenId: string;
  latitude: string;
  longitude: string;
  address: string;
  districtCode: string;
  containerId: string | null;
  reportType: ReportTypeEnum;
  description: string;
  status: ReportStatusEnum;
  resolutionNote: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  submittedAt: Date;
  acknowledgedAt: Date | null;
  evidences: EvidenceEntity[];
}