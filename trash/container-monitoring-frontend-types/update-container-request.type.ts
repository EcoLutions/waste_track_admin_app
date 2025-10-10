/**
 * Request DTO for updating a container
 * Corresponds to: UpdateContainerResource.java
 *
 * @see UpdateContainerResource.java in backend
 */
export interface UpdateContainerRequest {
  containerId: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  districtCode: string | null;
  volumeLiters: number | null;
  maxWeightKg: number | null;
  sensorId: string | null;
  containerType: string | null;
  districtId: string | null;
  collectionFrequencyDays: number | null;
}