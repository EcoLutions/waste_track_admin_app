import {AccountStatusEnum, UserEntity} from '../../model';
import {AuthenticatedUserResponse} from '../types/authenticated-user-response.type';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';

export class AuthenticatedUserFromResponseMapper {
  static fromDtoToEntity(dto: AuthenticatedUserResponse): UserEntity {
    return {
      id: dto.id ?? '',
      username: dto.username ?? '',
      email: dto.email ?? '',
      password: '',
      accountStatus: EnumMapper.mapStringToEnum(dto.status, AccountStatusEnum, AccountStatusEnum.ACTIVE),
      failedLoginAttempts: dto.failedLoginAttempts ?? 0,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
      passwordChangedAt: dto.passwordChangedAt ? new Date(dto.passwordChangedAt) : null,
      roles: dto.roles
        ? dto.roles.map((role) => ({
          id: '',
          name: role as any,
        }))
        : [],
      token: dto.token ?? '',
    };
  }
}
