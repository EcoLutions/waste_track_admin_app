/**
 * Request DTO for updating a citizen
 * Corresponds to: UpdateCitizenResource.java
 *
 * @see UpdateCitizenResource.java in backend
 */
export interface UpdateCitizenRequest {
  citizenId: string | null;
  districtId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
}
