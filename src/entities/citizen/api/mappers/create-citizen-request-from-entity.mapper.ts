import { CitizenEntity } from '../../model';
import { CreateCitizenRequest } from '../types/create-citizen-request.type';

export class CreateCitizenRequestFromEntityMapper {
  static fromEntityToDto(entity: CitizenEntity): CreateCitizenRequest {
    return {
      userId: entity.userId,
      districtId: entity.districtId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phoneNumber: entity.phoneNumber
    };
  }
}
