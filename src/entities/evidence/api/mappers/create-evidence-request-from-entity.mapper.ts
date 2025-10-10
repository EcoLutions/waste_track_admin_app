import { EvidenceEntity } from '../../model';
import { CreateEvidenceRequest } from '../types/create-evidence-request.type';

export class CreateEvidenceRequestFromEntityMapper {
  static fromEntityToDto(entity: EvidenceEntity): CreateEvidenceRequest {
    return {
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
