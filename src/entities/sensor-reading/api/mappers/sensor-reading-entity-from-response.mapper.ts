import { SensorReadingEntity } from '../../model';
import { SensorReadingResponse } from '../types/sensor-reading-response.type';
import { ValidationStatusEnum } from '../../model';

export class SensorReadingEntityFromResponseMapper {
  static fromDtoToEntity(dto: SensorReadingResponse): SensorReadingEntity {
    return {
      id: dto.id ?? '',
      containerId: dto.containerId ?? '',
      fillLevelPercentage: dto.fillLevelPercentage ?? 0,
      temperatureCelsius: dto.temperatureCelsius ?? 0,
      batteryLevelPercentage: dto.batteryLevelPercentage ?? 0,
      recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
      isValidated: false, // TODO: Map from validation status
      validationStatus: SensorReadingEntityFromResponseMapper.mapStringToValidationStatus(dto.validationStatus ?? ''),
      receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToValidationStatus(status: string): ValidationStatusEnum {
    const statusKey = Object.keys(ValidationStatusEnum).find(
      key => ValidationStatusEnum[key as keyof typeof ValidationStatusEnum] === status
    );

    if (statusKey) {
      return ValidationStatusEnum[statusKey as keyof typeof ValidationStatusEnum];
    }

    console.warn(`Invalid validation status received: ${status}, defaulting to SENSOR_ERROR`);
    return ValidationStatusEnum.SENSOR_ERROR;
  }
}
