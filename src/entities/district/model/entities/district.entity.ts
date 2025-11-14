import {OperationalStatusEnum} from '../enums/operational-status.enum';

export interface DistrictEntity {
  id: string;
  name: string;
  code: string;
  operationalStatus: OperationalStatusEnum;
  serviceStartDate: Date | null;
  operationStartTime: string;
  operationEndTime: string;
  maxRouteDuration: string;
  depotLatitude: string;
  depotLongitude: string;
  disposalLatitude: string;
  disposalLongitude: string;
  planId: string;
  planName: string;
  maxVehicles: number;
  maxDrivers: number;
  maxContainers: number;
  currency: string;
  price: string;
  billingPeriod: string;
  currentVehicleCount: number;
  currentDriverCount: number;
  currentContainerCount: number;
  primaryAdminEmail: string | null;
  primaryAdminUsername: string | null;
}
