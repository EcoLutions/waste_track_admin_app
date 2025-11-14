import { DistrictEntity } from '../../model';
import { UpdateDistrictRequest } from '../types/update-district-request.type';

export class UpdateDistrictRequestFromEntityMapper {
  static fromEntityToDto(entity: DistrictEntity): UpdateDistrictRequest {
    return {
      districtId: entity.id,
      name: entity.name ?? null,
      code: entity.code ?? null,
      depotLatitud: entity.depotLatitude ?? null,
      depotLongitude: entity.depotLongitude ?? null,
      operationStartTime: entity.operationStartTime ?? null,
      operationEndTime: entity.operationEndTime ?? null,
      maxRouteDuration: entity.maxRouteDuration ?? null,
    };
  }
}
