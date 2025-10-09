export interface CreateSensorReadingRequest {
  containerId: string | null;
  fillLevelPercentage: number | null;
  temperatureCelsius: number | null;
  batteryLevelPercentage: number | null;
}
