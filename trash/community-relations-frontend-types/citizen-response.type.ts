/**
 * Response DTO for citizen data
 * Corresponds to: CitizenResource.java
 *
 * @see CitizenResource.java in backend
 */
export interface CitizenResponse {
  id: string | null;
  userId: string | null;
  districtId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  membershipLevel: string | null;
  totalPoints: number | null;
  totalReportsSubmitted: number | null;
  lastActivityDate: string | null; // LocalDateTime → ISO string
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}