export interface UpdateVehicleRequest {
  vehicleId: string | null;
  licensePlate: string | null;
  vehicleType: string | null;
  volumeCapacity: number | null; // BigDecimal as number
  weightCapacity: number | null; // BigDecimal as number
  districtId: string | null;
  assignedDriverId: string | null;
  lastMaintenanceDate: string | null; // LocalDateTime → ISO string
  nextMaintenanceDate: string | null; // LocalDateTime → ISO string
  isActive: boolean | null;
}
