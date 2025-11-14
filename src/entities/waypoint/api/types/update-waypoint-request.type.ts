export interface UpdateWaypointRequest {
  sequenceOrder: number | null;
  priority: string | null;
  estimatedArrivalTime: string | null; // LocalDateTime → ISO string

}
