import { UserProfileEntity } from '../../model';
import { UserProfileResponse } from '../types/user-profile-response.type';
import { UserTypeEnum, LanguageEnum } from '../../model';

export class UserProfileEntityFromResponseMapper {
  static fromDtoToEntity(dto: UserProfileResponse): UserProfileEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      photoPath: dto.photoPath,
      userType: UserProfileEntityFromResponseMapper.mapStringToUserType(dto.userType ?? ''),
      districtId: dto.districtId ?? '',
      email: dto.email ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      emailNotificationsEnabled: dto.emailNotificationsEnabled ?? false,
      smsNotificationsEnabled: dto.smsNotificationsEnabled ?? false,
      pushNotificationsEnabled: dto.pushNotificationsEnabled ?? false,
      deviceTokens: [], // TODO: Map device tokens if provided in response
      language: UserProfileEntityFromResponseMapper.mapStringToLanguage(dto.language ?? ''),
      timezone: dto.timezone ?? 'America/Lima',
      isActive: dto.isActive ?? true,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToUserType(userType: string): UserTypeEnum {
    const typeKey = Object.keys(UserTypeEnum).find(
      key => UserTypeEnum[key as keyof typeof UserTypeEnum] === userType
    );

    if (typeKey) {
      return UserTypeEnum[typeKey as keyof typeof UserTypeEnum];
    }

    console.warn(`Invalid user type received: ${userType}, defaulting to CITIZEN`);
    return UserTypeEnum.CITIZEN;
  }

  private static mapStringToLanguage(language: string): LanguageEnum {
    const languageKey = Object.keys(LanguageEnum).find(
      key => LanguageEnum[key as keyof typeof LanguageEnum] === language
    );

    if (languageKey) {
      return LanguageEnum[languageKey as keyof typeof LanguageEnum];
    }

    console.warn(`Invalid language received: ${language}, defaulting to ES`);
    return LanguageEnum.ES;
  }
}
