import { AttemptStatusEnum } from '../enums/attempt-status.enum';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { ProviderTypeEnum } from '../enums/provider-type.enum';

export interface DeliveryAttemptEntity {
  id: string;
  requestId: string;
  channel: NotificationChannelEnum;
  provider: ProviderTypeEnum;
  providerMessageId: string;
  status: AttemptStatusEnum;
  attemptNumber: number;
  canRetry: boolean;
  sentAt: Date;
  deliveredAt: Date | null;
  errorCode: string | null;
  errorMessage: string | null;
  costAmount: number;
  costCurrency: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
