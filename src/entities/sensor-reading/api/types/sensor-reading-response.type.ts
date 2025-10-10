export interface SensorReadingResponse {
  id: string | null;
  containerId: string | null;
  fillLevelPercentage: number | null;
  temperatureCelsius: number | null;
  batteryLevelPercentage: number | null;
  validationStatus: string | null;
  recordedAt: string | null; // LocalDateTime → ISO string
  receivedAt: string | null; // LocalDateTime → ISO string
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
