import { ContainerEntity } from '../../model';
import { UpdateContainerRequest } from '../types/update-container-request.type';

export class UpdateContainerRequestFromEntityMapper {
  static fromEntityToDto(entity: ContainerEntity): UpdateContainerRequest {
    return {
      containerId: entity.id,
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      districtCode: entity.districtCode,
      volumeLiters: entity.volumeLiters,
      maxWeightKg: entity.maxWeightKg,
      sensorId: entity.sensorId,
      containerType: entity.containerType,
      districtId: entity.districtId,
      collectionFrequencyDays: entity.collectionFrequencyDays
    };
  }
}
