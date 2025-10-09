import { CitizenEntity } from '../../model';
import { CitizenResponse } from '../types/citizen-response.type';
import { MembershipLevelEnum } from '../../model';

export class CitizenEntityFromResponseMapper {
  static fromDtoToEntity(dto: CitizenResponse): CitizenEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      districtId: dto.districtId ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      email: dto.email ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      membershipLevel: CitizenEntityFromResponseMapper.mapStringToMembershipLevel(dto.membershipLevel ?? ''),
      totalPoints: dto.totalPoints ?? 0,
      totalReportsSubmitted: dto.totalReportsSubmitted ?? 0,
      lastActivityDate: dto.lastActivityDate ? new Date(dto.lastActivityDate) : new Date(),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToMembershipLevel(level: string): MembershipLevelEnum {
    const levelKey = Object.keys(MembershipLevelEnum).find(
      key => MembershipLevelEnum[key as keyof typeof MembershipLevelEnum] === level
    );

    if (levelKey) {
      return MembershipLevelEnum[levelKey as keyof typeof MembershipLevelEnum];
    }

    console.warn(`Invalid membership level received: ${level}, defaulting to BRONZE`);
    return MembershipLevelEnum.BRONZE;
  }
}
