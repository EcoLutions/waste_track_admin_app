import { ReportEntity } from '../../model';
import { ReportResponse } from '../types/report-response.type';
import { ReportTypeEnum, ReportStatusEnum } from '../../model';


export class ReportEntityFromResponseMapper {
  static fromDtoToEntity(dto: ReportResponse): ReportEntity {
    return {
      id: dto.id ?? '',
      citizenId: dto.citizenId ?? '',
      districtId: dto.districtId ?? '',
      latitude: dto.latitude ?? '',
      longitude: dto.longitude ?? '',
      containerId: dto.containerId,
      reportType: ReportEntityFromResponseMapper.mapStringToReportType(dto.reportType ?? ''),
      description: dto.description ?? '',
      status: ReportEntityFromResponseMapper.mapStringToReportStatus(dto.status ?? ''),
      resolutionNote: dto.resolutionNote,
      resolvedAt: dto.resolvedAt ? new Date(dto.resolvedAt) : null,
      resolvedBy: dto.resolvedBy,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
      acknowledgedAt: dto.acknowledgedAt ? new Date(dto.acknowledgedAt) : null,
      evidences: [], // TODO: Map evidences when evidence service is available
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToReportType(reportType: string): ReportTypeEnum {
    const normalized = (reportType ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(ReportTypeEnum).find(key => {
      const val = ReportTypeEnum[key as keyof typeof ReportTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return ReportTypeEnum[typeKey as keyof typeof ReportTypeEnum];
    }

    console.warn(`Invalid report type received: ${reportType}, defaulting to OTHER`);
    return ReportTypeEnum.OTHER;
  }

  private static mapStringToReportStatus(status: string): ReportStatusEnum {
    const normalized = (status ?? '').toString().trim().toLowerCase();

    const statusKey = Object.keys(ReportStatusEnum).find(key => {
      const val = ReportStatusEnum[key as keyof typeof ReportStatusEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (statusKey) {
      return ReportStatusEnum[statusKey as keyof typeof ReportStatusEnum];
    }

    console.warn(`Invalid report status received: ${status}, defaulting to SUBMITTED`);
    return ReportStatusEnum.SUBMITTED;
  }
}
