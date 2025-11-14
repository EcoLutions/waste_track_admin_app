export interface UpdateRouteRequest {
  routeId: string | null;
  scheduledDate: string | null; // LocalDate → ISO string
}
