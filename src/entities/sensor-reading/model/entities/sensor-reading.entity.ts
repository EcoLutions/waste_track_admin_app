import { ValidationStatusEnum } from '../enums/validation-status.enum';

export interface SensorReadingEntity {
  id: string;
  containerId: string;
  fillLevelPercentage: number;
  temperatureCelsius: number;
  batteryLevelPercentage: number;
  recordedAt: Date;
  isValidated: boolean;
  validationStatus: ValidationStatusEnum;
  receivedAt: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
}
