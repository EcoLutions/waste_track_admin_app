/**
 * SensorReading domain entity for frontend
 * Based on: SensorReading.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see SensorReading.java in backend
 */
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
}