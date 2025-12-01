export interface UpdateContainerRequest {
  containerId: string | null;
  latitude: string | null;
  longitude: string | null;
  volumeLiters: number | null;
  maxFillLevel: number | null;
  deviceId: string | null;
  containerType: string | null;
  districtId: string | null;
  collectionFrequencyDays: number | null;
}
