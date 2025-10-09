import { DriverEntity } from '../../model';
import { UpdateDriverRequest } from '../types/update-driver-request.type';

export class UpdateDriverRequestFromEntityMapper {
  static fromEntityToDto(entity: DriverEntity): UpdateDriverRequest {
    return {
      driverId: entity.id,
      districtId: entity.districtId ?? null,
      firstName: entity.firstName ?? null,
      lastName: entity.lastName ?? null,
      documentNumber: entity.documentNumber ?? null,
      phoneNumber: entity.phoneNumber ?? null,
      userId: entity.userId ?? null,
      driverLicense: entity.driverLicense ?? null,
      licenseExpiryDate: entity.licenseExpiryDate?.toISOString() ?? null,
      emailAddress: entity.emailAddress ?? null
    };
  }
}
