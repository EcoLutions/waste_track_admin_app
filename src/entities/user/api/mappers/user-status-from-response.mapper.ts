import {AccountStatusEnum} from '../../model';

export class UserStatusFromResponseMapper {
  static mapStringToAccountStatus(status: string): AccountStatusEnum {
    const normalized = (status ?? '').toString().trim().toUpperCase();

    const statusKey = Object.keys(AccountStatusEnum).find((key) => {
      const val = AccountStatusEnum[key as keyof typeof AccountStatusEnum];
      return String(val).toUpperCase() === normalized || key.toUpperCase() === normalized;
    });

    if (statusKey) {
      return AccountStatusEnum[statusKey as keyof typeof AccountStatusEnum];
    }

    console.warn(`Invalid account status received: ${status}, defaulting to ACTIVE`);
    return AccountStatusEnum.ACTIVE;
  }
}
