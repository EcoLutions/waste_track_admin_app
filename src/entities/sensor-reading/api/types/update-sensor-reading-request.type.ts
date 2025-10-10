export interface UpdateSensorReadingRequest {
  containerId: string | null;
  fillLevelPercentage: number | null;
  temperatureCelsius: number | null;
  batteryLevelPercentage: number | null;
}
