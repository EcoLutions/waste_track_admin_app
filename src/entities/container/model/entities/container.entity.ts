import { ContainerTypeEnum } from '../enums/container-type.enum';
import { ContainerStatusEnum } from '../enums/container-status.enum';

export interface ContainerEntity {
  id: string;
  latitude: string;
  longitude: string;
  volumeLiters: number;
  maxFillLevel: number;
  containerType: ContainerTypeEnum;
  status: ContainerStatusEnum;
  currentFillLevel: number;
  deviceId: string | null;
  lastReadingTimestamp: Date | null;
  districtId: string;
  lastCollectionDate: Date | null;
  collectionFrequencyDays: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}
