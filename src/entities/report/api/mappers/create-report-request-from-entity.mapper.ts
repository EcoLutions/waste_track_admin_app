import { ReportEntity } from '../../model';
import { CreateReportRequest } from '../types/create-report-request.type';

export class CreateReportRequestFromEntityMapper {
  static fromEntityToDto(entity: ReportEntity): CreateReportRequest {
    return {
      citizenId: entity.citizenId,
      districtId: entity.districtId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      containerId: entity.containerId,
      reportType: entity.reportType,
      description: entity.description,
      evidenceIds: entity.evidences.map(e => e.id) // Extract evidence IDs
    };
  }
}
