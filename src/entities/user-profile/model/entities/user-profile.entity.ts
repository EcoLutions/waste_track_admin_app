import { UserTypeEnum } from '../enums/user-type.enum';
import { LanguageEnum } from '../enums/language.enum';

export interface UserProfileEntity {
  id: string;
  userId: string;
  photoPath: string | null;
  photoUrl: string | null;
  userType: UserTypeEnum;
  districtId: string;
  email: string;
  phoneNumber: string;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  deviceTokens: string[];
  language: LanguageEnum;
  timezone: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
