export interface CreateContainerRequest {
  latitude: string | null;
  longitude: string | null;
  volumeLiters: number | null;
  maxFillLevel: number | null;
  deviceIdentifier: string | null;
  containerType: string | null;
  districtId: string | null;
  collectionFrequencyDays: number | null;
}
