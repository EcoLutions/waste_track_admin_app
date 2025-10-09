/**
 * Route domain entity for frontend
 * Based on: Route.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see Route.java in backend
 */
export interface RouteEntity {
  id: string;
  districtId: string;
  vehicleId: string | null;
  driverId: string | null;
  routeType: RouteTypeEnum;
  status: RouteStatusEnum;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  waypoints: WaypointEntity[];
  totalDistance: number | null;
  estimatedDuration: number | null; // Duration in minutes
  actualDuration: number | null; // Duration in minutes
}