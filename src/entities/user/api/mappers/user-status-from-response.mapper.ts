import {AccountStatusEnum} from '../../model';

export class UserStatusFromResponseMapper {
  static mapStringToAccountStatus(status: string): AccountStatusEnum {
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
