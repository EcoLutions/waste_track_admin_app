/**
 * Request DTO for updating a sensor reading
 * Corresponds to: UpdateSensorReadingResource.java
 *
 * @see UpdateSensorReadingResource.java in backend
 */
export interface UpdateSensorReadingRequest {
  containerId: string | null;
  fillLevelPercentage: number | null;
  temperatureCelsius: number | null;
  batteryLevelPercentage: number | null;
}