export interface UpdateRouteRequest {
  districtId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  routeType: string | null;
  status: string | null;
  scheduledDate: string | null; // LocalDate → ISO string
  startedAt: string | null; // LocalDateTime → ISO string
  completedAt: string | null; // LocalDateTime → ISO string
  totalDistance: DistanceResource | null;
  estimatedDuration: DurationResource | null;
  actualDuration: DurationResource | null;
}

export interface DistanceResource {
  value: number | null;
  unit: string | null;
}

export interface DurationResource {
  hours: number | null;
  minutes: number | null;
  seconds: number | null;
}
