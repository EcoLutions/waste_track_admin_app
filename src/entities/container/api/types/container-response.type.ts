export interface ContainerResponse {
  id: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  districtCode: string | null;
  volumeLiters: number | null;
  maxWeightKg: number | null;
  containerType: string | null;
  status: string | null;
  currentFillLevel: number | null;
  sensorId: string | null;
  lastReadingTimestamp: string | null; // LocalDateTime → ISO string
  districtId: string | null;
  lastCollectionDate: string | null; // LocalDateTime → ISO string
  collectionFrequencyDays: number | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
