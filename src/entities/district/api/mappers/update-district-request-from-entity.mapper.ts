import { DistrictEntity } from '../../model';
import { UpdateDistrictRequest } from '../types/update-district-request.type';

export class UpdateDistrictRequestFromEntityMapper {
  static fromEntityToDto(entity: DistrictEntity): UpdateDistrictRequest {
    return {
      districtId: entity.id,
      name: entity.name ?? null,
      code: entity.code ?? null,
      boundaries: entity.boundaries ?? null,
      primaryAdminEmail: entity.primaryAdminEmail ?? null
    };
  }
}
