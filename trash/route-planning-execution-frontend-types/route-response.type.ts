/**
 * Response DTO for route data
 * Corresponds to: RouteResource.java
 *
 * @see RouteResource.java in backend
 */
export interface RouteResponse {
  id: string | null;
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
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}

/**
 * Distance resource for route calculations
 */
export interface DistanceResource {
  value: number | null;
  unit: string | null;
}

/**
 * Duration resource for time calculations
 */
export interface DurationResource {
  hours: number | null;
  minutes: number | null;
  seconds: number | null;
}