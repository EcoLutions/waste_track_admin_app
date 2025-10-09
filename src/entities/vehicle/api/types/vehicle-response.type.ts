export interface VehicleResponse {
  id: string | null;
  licensePlate: string | null;
  vehicleType: string | null;
  volumeCapacity: string | null; // BigDecimal as string
  weightCapacity: number | null; // Integer in backend
  mileage: number | null; // Integer in backend
  districtId: string | null;
  assignedDriverId: string | null;
  lastMaintenanceDate: string | null; // LocalDateTime → ISO string
  nextMaintenanceDate: string | null; // LocalDateTime → ISO string
  isActive: boolean | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
