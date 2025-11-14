import { DistrictEntity } from '../../model';
import { CreateDistrictRequest } from '../types/create-district-request.type';

export class CreateDistrictRequestFromEntityMapper {
  static fromEntityToDto(entity: DistrictEntity): CreateDistrictRequest {
    return {
      name: entity.name,
      code: entity.code,
      primaryAdminEmail: entity.primaryAdminEmail,
      primaryAdminUsername: entity.primaryAdminUsername,
      planId: entity.planId,
    };
  }
}
