/**
 * Request DTO for creating a new route
 * Corresponds to: CreateRouteResource.java
 *
 * @see CreateRouteResource.java in backend
 */
export interface CreateRouteRequest {
  districtId: string | null;
  routeType: string | null;
  scheduledDate: string | null; // LocalDate → ISO string
}