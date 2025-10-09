export interface WaypointResponse {
  id: string | null;
  containerId: string | null;
  sequenceOrder: number | null;
  priority: string | null;
  status: string | null;
  estimatedArrivalTime: string | null; // LocalDateTime → ISO string
  actualArrivalTime: string | null; // LocalDateTime → ISO string
  driverNote: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
