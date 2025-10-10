export interface CreateUserProfileRequest {
  userId: string | null;
  photoPath: string | null;
  userType: string | null;
  districtId: string | null;
  email: string | null;
  phoneNumber: string | null;
  language: string | null;
  timezone: string | null;
}
