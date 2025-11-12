import {RoleEntity, RolesEnum} from '../../model';
import {RoleResponse} from '../types/role-response.type';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';

export class RoleEntityFromResponseMapper {
  static fromDtoToEntity(dto: RoleResponse): RoleEntity {
    return {
      id: dto.id ?? '',
      name: EnumMapper.mapStringToEnum(dto.name, RolesEnum, RolesEnum.ROLE_CITIZEN)
    };
  }
}
