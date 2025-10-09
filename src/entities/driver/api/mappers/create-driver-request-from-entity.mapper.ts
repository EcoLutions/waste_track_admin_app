import { DriverEntity } from '../../model/entities/driver.entity';
import { CreateDriverRequest } from '../types/create-driver-request.type';

export class CreateDriverRequestFromEntityMapper {
  static fromEntityToDto(entity: DriverEntity): CreateDriverRequest {
    return {
      districtId: entity.districtId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      documentNumber: entity.documentNumber,
      phoneNumber: entity.phoneNumber,
      userId: entity.userId,
      driverLicense: entity.driverLicense,
      licenseExpiryDate: entity.licenseExpiryDate.toISOString(),
      emailAddress: entity.emailAddress
    };
  }
}
