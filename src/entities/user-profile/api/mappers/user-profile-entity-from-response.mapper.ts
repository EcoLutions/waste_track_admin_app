import {LanguageEnum, UserProfileEntity} from '../../model';
import {UserProfileResponse} from '../types/user-profile-response.type';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';

export class UserProfileEntityFromResponseMapper {
  static fromDtoToEntity(dto: UserProfileResponse): UserProfileEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      photoPath: dto.photoPath,
      photoUrl: dto.temporalPhotoUrl,
      districtId: dto.districtId ?? '',
      email: dto.email ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      emailNotificationsEnabled: dto.emailNotificationsEnabled ?? false,
      smsNotificationsEnabled: dto.smsNotificationsEnabled ?? false,
      pushNotificationsEnabled: dto.pushNotificationsEnabled ?? false,
      deviceTokens: [], // TODO: Map device tokens if provided in response
      language: EnumMapper.mapStringToEnum(dto.language, LanguageEnum, LanguageEnum.ES),
      timezone: dto.timezone ?? 'America/Lima',
      isActive: dto.isActive ?? true,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }
}
