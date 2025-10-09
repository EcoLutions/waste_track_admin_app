export interface CreateVehicleRequest {
  licensePlate: string | null;
  vehicleType: string | null;
  volumeCapacity: string | null; // BigDecimal as string
  weightCapacity: string | null; // BigDecimal as string
  districtId: string | null;
}
