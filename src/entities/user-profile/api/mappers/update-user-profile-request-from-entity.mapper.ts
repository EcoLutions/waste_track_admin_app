import { UserProfileEntity } from '../../model';
import { UpdateUserProfileRequest } from '../types/update-user-profile-request.type';

export class UpdateUserProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: UserProfileEntity): UpdateUserProfileRequest {
    return {
      photoPath: entity.photoPath,
      userType: entity.userType,
      districtId: entity.districtId,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      emailNotificationsEnabled: entity.emailNotificationsEnabled,
      smsNotificationsEnabled: entity.smsNotificationsEnabled,
      pushNotificationsEnabled: entity.pushNotificationsEnabled,
      language: entity.language,
      timezone: entity.timezone,
      isActive: entity.isActive
    };
  }
}
