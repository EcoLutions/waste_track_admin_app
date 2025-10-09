import {OperationalStatusEnum} from '../enums/operational-status.enum';

export interface DistrictEntity {
  id: string;
  name: string;
  code: string;
  boundaries: string;
  operationalStatus: OperationalStatusEnum;
  serviceStartDate: Date | null;
  subscriptionId: string;
  maxVehicles: number;
  maxDrivers: number;
  maxContainers: number;
  primaryAdminEmail: string;
}
