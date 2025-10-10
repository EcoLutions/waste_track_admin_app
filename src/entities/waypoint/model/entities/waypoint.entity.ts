import { PriorityEnum } from '../enums/priority.enum';
import { WaypointStatusEnum } from '../enums/waypoint-status.enum';

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
  createdAt: Date | null;
  updatedAt: Date | null;
}
