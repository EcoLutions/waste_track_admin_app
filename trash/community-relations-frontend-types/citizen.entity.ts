/**
 * Citizen domain entity for frontend
 * Based on: Citizen.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see Citizen.java in backend
 */
export interface CitizenEntity {
  id: string;
  userId: string;
  districtId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  membershipLevel: MembershipLevelEnum;
  totalPoints: number;
  totalReportsSubmitted: number;
  lastActivityDate: Date;
}