/**
 * Request DTO for creating a new waypoint
 * Corresponds to: CreateWayPointResource.java
 *
 * @see CreateWayPointResource.java in backend
 */
export interface CreateWaypointRequest {
  containerId: string | null;
  sequenceOrder: number | null;
  priority: string | null;
  estimatedArrivalTime: string | null; // LocalDateTime → ISO string
  driverNote: string | null;
}