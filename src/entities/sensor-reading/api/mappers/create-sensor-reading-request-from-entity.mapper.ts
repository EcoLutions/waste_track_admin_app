import { SensorReadingEntity } from '../../model';
import { CreateSensorReadingRequest } from '../types/create-sensor-reading-request.type';

export class CreateSensorReadingRequestFromEntityMapper {
  static fromEntityToDto(entity: SensorReadingEntity): CreateSensorReadingRequest {
    return {
      containerId: entity.containerId,
      fillLevelPercentage: entity.fillLevelPercentage,
      temperatureCelsius: entity.temperatureCelsius,
      batteryLevelPercentage: entity.batteryLevelPercentage
    };
  }
}
