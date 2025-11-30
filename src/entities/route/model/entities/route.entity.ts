import {RouteStatusEnum} from '../enums/route-status.enum';
import {WaypointEntity} from '../../../waypoint/model';

export interface RouteEntity {
  id: string;
  districtId: string;
  vehicleId: string | null;
  driverId: string | null;
  status: RouteStatusEnum;
  scheduledStartAt: Date;
  scheduledEndAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  waypoints: WaypointEntity[];
  totalDistance: number | null;
  estimatedDuration: number | null;
  collectionDuration: number | null;
  returnDuration: number | null;
  actualDuration: number | null;
  currentLatitude: string | null;
  currentLongitude: string | null;
  lastLocationUpdate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
