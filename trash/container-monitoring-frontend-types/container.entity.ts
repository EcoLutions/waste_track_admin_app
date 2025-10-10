/**
 * Container domain entity for frontend
 * Based on: Container.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see Container.java in backend
 */
export interface ContainerEntity {
  id: string;
  latitude: string;
  longitude: string;
  address: string;
  districtCode: string;
  volumeLiters: number;
  maxWeightKg: number;
  containerType: ContainerTypeEnum;
  status: ContainerStatusEnum;
  currentFillLevel: number;
  sensorId: string | null;
  lastReadingTimestamp: Date | null;
  districtId: string;
  lastCollectionDate: Date | null;
  collectionFrequencyDays: number;
}