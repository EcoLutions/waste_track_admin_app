import {AccountStatusEnum, UserEntity} from '../../model';
import {AuthenticatedUserResponse} from '../types/authenticated-user-response.type';

export class AuthenticatedUserFromResponseMapper {
  static fromDtoToEntity(dto: AuthenticatedUserResponse): UserEntity {
    return {
      id: dto.id ?? '',
      username: dto.username ?? '',
      password: '', // Password is not returned in responses for security
      accountStatus: AccountStatusEnum.ACTIVE, // Default to active for authenticated users
      failedLoginAttempts: 0, // Not provided in auth response
      lastLoginAt: null, // Not provided in auth response
      passwordChangedAt: null, // Not provided in auth response
      roles: [] // Would need separate call to get user roles
    };
  }
}
