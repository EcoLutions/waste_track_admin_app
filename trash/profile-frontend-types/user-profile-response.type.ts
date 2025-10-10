/**
 * Response DTO for user profile data
 * Corresponds to: UserProfileResource.java
 *
 * @see UserProfileResource.java in backend
 */
export interface UserProfileResponse {
  id: string | null;
  userId: string | null;
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
  temporalPhotoUrl: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}