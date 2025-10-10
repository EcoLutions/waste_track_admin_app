/**
 * Request DTO for creating a new sensor reading
 * Corresponds to: CreateSensorReadingResource.java
 *
 * @see CreateSensorReadingResource.java in backend
 */
export interface CreateSensorReadingRequest {
  containerId: string | null;
  fillLevelPercentage: number | null;
  temperatureCelsius: number | null;
  batteryLevelPercentage: number | null;
}