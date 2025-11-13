export interface CreateContainerRequest {
  latitude: string | null;
  longitude: string | null;
  volumeLiters: number | null;
  maxWeightKg: number | null;
  sensorId: string | null;
  containerType: string | null;
  districtId: string | null;
  collectionFrequencyDays: number | null;
}
