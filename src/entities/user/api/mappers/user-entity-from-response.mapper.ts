import {UserEntity} from '../../model';
import {UserResponse} from '../types/user-response.type';
import {AccountStatusEnum} from '../../model';

export class UserEntityFromResponseMapper {
  static fromDtoToEntity(dto: UserResponse): UserEntity {
    return {
      id: dto.id ?? '',
      username: dto.username ?? '',
      password: '', // Password is not returned in responses for security
      accountStatus: UserEntityFromResponseMapper.mapStringToAccountStatus(dto.status ?? ''),
      failedLoginAttempts: dto.failedLoginAttempts ?? 0,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
      passwordChangedAt: dto.passwordChangedAt ? new Date(dto.passwordChangedAt) : null,
      roles: dto.roles ? dto.roles.map(role => ({
        id: '', // Role ID not provided in user response, would need separate call
        name: role as any // This would need proper mapping based on your role enum
      })) : []
    };
  }

  private static mapStringToAccountStatus(status: string): AccountStatusEnum {
    const statusKey = Object.keys(AccountStatusEnum).find(
      key => AccountStatusEnum[key as keyof typeof AccountStatusEnum] === status
    );

    if (statusKey) {
      return AccountStatusEnum[statusKey as keyof typeof AccountStatusEnum];
    }

    console.warn(`Invalid account status received: ${status}, defaulting to ACTIVE`);
    return AccountStatusEnum.ACTIVE;
  }
}
