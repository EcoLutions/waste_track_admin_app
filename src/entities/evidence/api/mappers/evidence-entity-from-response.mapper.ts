import { EvidenceEntity } from '../../model';
import { EvidenceResponse } from '../types/evidence-response.type';
import { EvidenceTypeEnum } from '../../model';

export class EvidenceEntityFromResponseMapper {
  static fromDtoToEntity(dto: EvidenceResponse): EvidenceEntity {
    return {
      id: dto.id ?? '',
      type: EvidenceEntityFromResponseMapper.mapStringToEvidenceType(dto.type ?? ''),
      fileUrl: dto.fileUrl ?? '',
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
    const raw = String(type ?? '').trim();
    if (!raw) return EvidenceTypeEnum.PHOTO;

    const normalized = raw.toLowerCase();

    //value match
    const enumValues = Object.values(EvidenceTypeEnum).filter(v => true) as string[];
    const valueMatch = enumValues.find(v => v.toLowerCase() === normalized);
    if (valueMatch) {
      return valueMatch as unknown as EvidenceTypeEnum;
    }

    //key match
    const enumKeys = Object.keys(EvidenceTypeEnum).filter(k => isNaN(Number(k)));
    const keyMatch = enumKeys.find(k => k.toLowerCase() === normalized);
    if (keyMatch) {
      return EvidenceTypeEnum[keyMatch as keyof typeof EvidenceTypeEnum];
    }

    console.warn(`Invalid evidence type received: ${type}, defaulting to PHOTO`);
    return EvidenceTypeEnum.PHOTO;
  }
}
