/**
 * Request DTO for updating a waypoint
 * Corresponds to: UpdateWayPointResource.java
 *
 * @see UpdateWayPointResource.java in backend
 */
export interface UpdateWaypointRequest {
  sequenceOrder: number | null;
  priority: string | null;
  estimatedArrivalTime: string | null; // LocalDateTime → ISO string
  driverNote: string | null;
}