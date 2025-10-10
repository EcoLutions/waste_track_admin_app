import {DriverStatusEnum} from '../enums/driver-status.enum';

export interface DriverEntity {
  id: string;
  districtId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phoneNumber: string;
  userId: string;
  driverLicense: string;
  licenseExpiryDate: Date;
  emailAddress: string;
  totalHoursWorked: number;
  lastRouteCompletedAt: Date | null;
  status: DriverStatusEnum;
  assignedVehicleId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
