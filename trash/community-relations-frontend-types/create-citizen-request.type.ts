/**
 * Request DTO for creating a new citizen
 * Corresponds to: CreateCitizenResource.java
 *
 * @see CreateCitizenResource.java in backend
 */
export interface CreateCitizenRequest {
  userId: string | null;
  districtId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
}