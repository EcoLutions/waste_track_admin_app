import { UserProfileEntity } from '../../model';
import { CreateUserProfileRequest } from '../types/create-user-profile-request.type';

export class CreateUserProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: UserProfileEntity): CreateUserProfileRequest {
    return {
      userId: entity.userId,
      photoPath: entity.photoPath,
      userType: entity.userType,
      districtId: entity.districtId,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      language: entity.language,
      timezone: entity.timezone
    };
  }
}
