import { ReportTypeEnum } from '../enums/report-type.enum';
import { ReportStatusEnum } from '../enums/report-status.enum';
import {EvidenceEntity} from '../../../evidence/model';

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
  createdAt: Date | null;
  updatedAt: Date | null;
}
