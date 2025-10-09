import { RouteStatusEnum } from '../enums/route-status.enum';
import { RouteTypeEnum } from '../enums/route-type.enum';
import { WaypointEntity } from '../../../waypoint/model';

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
  createdAt: Date | null;
  updatedAt: Date | null;
}
