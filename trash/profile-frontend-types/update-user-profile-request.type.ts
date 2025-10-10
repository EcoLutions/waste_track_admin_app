/**
 * Request DTO for updating a user profile
 * Corresponds to: UpdateUserProfileResource.java
 *
 * @see UpdateUserProfileResource.java in backend
 */
export interface UpdateUserProfileRequest {
  photoPath: string | null;
  userType: string | null;
  districtId: string | null;
  email: string | null;
  phoneNumber: string | null;
  emailNotificationsEnabled: boolean | null;
  smsNotificationsEnabled: boolean | null;
  pushNotificationsEnabled: boolean | null;
  language: string | null;
  timezone: string | null;
  isActive: boolean | null;
}