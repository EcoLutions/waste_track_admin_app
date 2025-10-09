/**
 * Request DTO for updating a route
 * Corresponds to: UpdateRouteResource.java
 *
 * @see UpdateRouteResource.java in backend
 */
export interface UpdateRouteRequest {
  routeId: string | null;
  districtId: string | null;
  routeType: string | null;
  scheduledDate: string | null; // LocalDate → ISO string
}