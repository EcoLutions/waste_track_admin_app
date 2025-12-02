import { ContainerEntity } from '../../model';
import { CreateContainerRequest } from '../types/create-container-request.type';

export class CreateContainerRequestFromEntityMapper {
  static fromEntityToDto(entity: ContainerEntity): CreateContainerRequest {
    return {
      latitude: entity.latitude,
      longitude: entity.longitude,
      volumeLiters: entity.volumeLiters,
      maxFillLevel: entity.maxFillLevel,
      deviceIdentifier: entity.deviceId, //deviceId can be null
      containerType: entity.containerType,
      districtId: entity.districtId,
      collectionFrequencyDays: entity.collectionFrequencyDays
    };
  }
}
