import { ReportEntity } from '../../model';
import { CreateReportRequest } from '../types/create-report-request.type';

export class CreateReportRequestFromEntityMapper {
  static fromEntityToDto(entity: ReportEntity): CreateReportRequest {
    return {
      citizenId: entity.citizenId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      districtCode: entity.districtCode,
      containerId: entity.containerId,
      reportType: entity.reportType,
      description: entity.description,
      evidenceIds: entity.evidences.map(e => e.id) // Extract evidence IDs
    };
  }
}
