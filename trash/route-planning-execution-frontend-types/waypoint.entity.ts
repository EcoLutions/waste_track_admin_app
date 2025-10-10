/**
 * WayPoint domain entity for frontend
 * Based on: WayPoint.java (DDD Entity)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see WayPoint.java in backend
 */
export interface WaypointEntity {
  id: string;
  containerId: string;
  sequenceOrder: number;
  priority: PriorityEnum;
  status: WaypointStatusEnum;
  estimatedArrivalTime: Date | null;
  actualArrivalTime: Date | null;
  serviceTime: number | null; // Duration in minutes
  driverNote: string | null;
}