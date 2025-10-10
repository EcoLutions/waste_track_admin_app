import { EvidenceEntity } from '../../model';
import { EvidenceResponse } from '../types/evidence-response.type';
import { EvidenceTypeEnum } from '../../model';

export class EvidenceEntityFromResponseMapper {
  static fromDtoToEntity(dto: EvidenceResponse): EvidenceEntity {
    return {
      id: dto.id ?? '',
      type: EvidenceEntityFromResponseMapper.mapStringToEvidenceType(dto.type ?? ''),
      filePath: dto.filePath ?? '',
      originalFileName: dto.originalFileName ?? '',
      description: dto.description,
      fileSize: Number(dto.fileSize) || 0,
      mimeType: dto.mimeType ?? '',
      thumbnailUrl: dto.thumbnailUrl,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToEvidenceType(type: string): EvidenceTypeEnum {
    const typeKey = Object.keys(EvidenceTypeEnum).find(
      key => EvidenceTypeEnum[key as keyof typeof EvidenceTypeEnum] === type
    );

    if (typeKey) {
      return EvidenceTypeEnum[typeKey as keyof typeof EvidenceTypeEnum];
    }

    console.warn(`Invalid evidence type received: ${type}, defaulting to PHOTO`);
    return EvidenceTypeEnum.PHOTO;
  }
}
