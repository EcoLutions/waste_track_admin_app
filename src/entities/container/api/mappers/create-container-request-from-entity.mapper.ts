import { ContainerEntity } from '../../model';
import { CreateContainerRequest } from '../types/create-container-request.type';

export class CreateContainerRequestFromEntityMapper {
  static fromEntityToDto(entity: ContainerEntity): CreateContainerRequest {
    return {
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
