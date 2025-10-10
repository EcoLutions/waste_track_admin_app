/**
 * UserProfile domain entity for frontend
 * Based on: UserProfile.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see UserProfile.java in backend
 */
export interface UserProfileEntity {
  id: string;
  userId: string;
  photoPath: string | null;
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
}