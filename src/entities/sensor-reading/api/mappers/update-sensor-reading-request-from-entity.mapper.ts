import { SensorReadingEntity } from '../../model';
import { UpdateSensorReadingRequest } from '../types/update-sensor-reading-request.type';

export class UpdateSensorReadingRequestFromEntityMapper {
  static fromEntityToDto(entity: SensorReadingEntity): UpdateSensorReadingRequest {
    return {
      containerId: entity.containerId,
      fillLevelPercentage: entity.fillLevelPercentage,
      temperatureCelsius: entity.temperatureCelsius,
      batteryLevelPercentage: entity.batteryLevelPercentage
    };
  }
}
