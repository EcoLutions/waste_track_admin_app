import { ContainerEntity } from '../../model';
import { ContainerResponse } from '../types/container-response.type';
import { ContainerTypeEnum, ContainerStatusEnum } from '../../model';

export class ContainerEntityFromResponseMapper {
  static fromDtoToEntity(dto: ContainerResponse): ContainerEntity {
    return {
      id: dto.id ?? '',
      latitude: dto.latitude ?? '',
      longitude: dto.longitude ?? '',
      address: dto.address ?? '',
      districtCode: dto.districtCode ?? '',
      volumeLiters: dto.volumeLiters ?? 0,
      maxWeightKg: dto.maxWeightKg ?? 0,
      containerType: ContainerEntityFromResponseMapper.mapStringToContainerType(dto.containerType ?? ''),
      status: ContainerEntityFromResponseMapper.mapStringToContainerStatus(dto.status ?? ''),
      currentFillLevel: dto.currentFillLevel ?? 0,
      sensorId: dto.sensorId,
      lastReadingTimestamp: dto.lastReadingTimestamp ? new Date(dto.lastReadingTimestamp) : null,
      districtId: dto.districtId ?? '',
      lastCollectionDate: dto.lastCollectionDate ? new Date(dto.lastCollectionDate) : null,
      collectionFrequencyDays: dto.collectionFrequencyDays ?? 7,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToContainerType(containerType: string): ContainerTypeEnum {
    const typeKey = Object.keys(ContainerTypeEnum).find(
      key => ContainerTypeEnum[key as keyof typeof ContainerTypeEnum] === containerType
    );

    if (typeKey) {
      return ContainerTypeEnum[typeKey as keyof typeof ContainerTypeEnum];
    }

    console.warn(`Invalid container type received: ${containerType}, defaulting to GENERAL`);
    return ContainerTypeEnum.GENERAL;
  }

  private static mapStringToContainerStatus(status: string): ContainerStatusEnum {
    const statusKey = Object.keys(ContainerStatusEnum).find(
      key => ContainerStatusEnum[key as keyof typeof ContainerStatusEnum] === status
    );

    if (statusKey) {
      return ContainerStatusEnum[statusKey as keyof typeof ContainerStatusEnum];
    }

    console.warn(`Invalid container status received: ${status}, defaulting to ACTIVE`);
    return ContainerStatusEnum.ACTIVE;
  }
}
