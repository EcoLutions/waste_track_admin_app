import { ReportEntity } from '../../model';
import { UpdateReportRequest } from '../types/update-report-request.type';

export class UpdateReportRequestFromEntityMapper {
  static fromEntityToDto(entity: ReportEntity): UpdateReportRequest {
    return {
      reportId: entity.id,
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      districtCode: entity.districtCode,
      containerId: entity.containerId,
      reportType: entity.reportType,
      description: entity.description,
      resolutionNote: entity.resolutionNote
    };
  }
}
