import { PhotoEntity } from '../../model';
import { PhotoResponse } from '../types/photo-response.type';

export class PhotoEntityFromResponseMapper {
  static fromDtoToEntity(dto: PhotoResponse): PhotoEntity {
    return {
      filePath: dto.filePath ?? ''
    };
  }
}
