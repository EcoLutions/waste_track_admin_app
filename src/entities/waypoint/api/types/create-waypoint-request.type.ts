export interface CreateWaypointRequest {
  containerId: string | null;
  sequenceOrder: number | null;
  priority: string | null;
  status: string | null;
  estimatedArrivalTime: string | null; // LocalDateTime → ISO string
  actualArrivalTime: string | null; // LocalDateTime → ISO string
  driverNote: string | null;
}
