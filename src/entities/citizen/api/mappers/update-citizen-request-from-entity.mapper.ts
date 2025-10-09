import { CitizenEntity } from '../../model';
import { UpdateCitizenRequest } from '../types/update-citizen-request.type';

export class UpdateCitizenRequestFromEntityMapper {
  static fromEntityToDto(entity: CitizenEntity): UpdateCitizenRequest {
    return {
      citizenId: entity.id,
      districtId: entity.districtId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phoneNumber: entity.phoneNumber
    };
  }
}
