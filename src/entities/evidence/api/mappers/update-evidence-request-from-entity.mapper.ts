import { EvidenceEntity } from '../../model';
import { UpdateEvidenceRequest } from '../types/update-evidence-request.type';

export class UpdateEvidenceRequestFromEntityMapper {
  static fromEntityToDto(entity: EvidenceEntity): UpdateEvidenceRequest {
    return {
      evidenceId: entity.id,
      type: entity.type,
      filePath: entity.filePath,
      originalFileName: entity.originalFileName,
      description: entity.description,
      fileSize: entity.fileSize,
      mimeType: entity.mimeType,
      thumbnailUrl: entity.thumbnailUrl
    };
  }
}
