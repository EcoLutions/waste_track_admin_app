import { ContainerEntity } from '../../model';
import { UpdateContainerRequest } from '../types/update-container-request.type';

export class UpdateContainerRequestFromEntityMapper {
  static fromEntityToDto(entity: ContainerEntity): UpdateContainerRequest {
    return {
      containerId: entity.id,
      latitude: entity.latitude,
      longitude: entity.longitude,
      volumeLiters: entity.volumeLiters,
      maxFillLevel: entity.maxFillLevel,
      deviceId: entity.deviceId,
      containerType: entity.containerType,
      status: entity.status,
      districtId: entity.districtId,
      collectionFrequencyDays: entity.collectionFrequencyDays
    };
  }
}
