import { MembershipLevelEnum } from '../enums/membership-level.enum';

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
  createdAt: Date | null;
  updatedAt: Date | null;
}
