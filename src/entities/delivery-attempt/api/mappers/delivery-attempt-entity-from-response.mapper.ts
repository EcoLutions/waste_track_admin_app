import { DeliveryAttemptEntity } from '../../model';
import { DeliveryAttemptResponse } from '../types/delivery-attempt-response.type';
import { AttemptStatusEnum, NotificationChannelEnum, ProviderTypeEnum } from '../../model';

export class DeliveryAttemptEntityFromResponseMapper {
  static fromDtoToEntity(dto: DeliveryAttemptResponse): DeliveryAttemptEntity {
    return {
      id: dto.id ?? '',
      requestId: dto.requestId ?? '',
      channel: DeliveryAttemptEntityFromResponseMapper.mapStringToNotificationChannel(dto.channel ?? ''),
      provider: DeliveryAttemptEntityFromResponseMapper.mapStringToProviderType(dto.provider ?? ''),
      providerMessageId: dto.providerMessageId ?? '',
      status: DeliveryAttemptEntityFromResponseMapper.mapStringToAttemptStatus(dto.status ?? ''),
      attemptNumber: dto.attemptNumber ?? 0,
      canRetry: dto.canRetry ?? false,
      sentAt: dto.sentAt ? new Date(dto.sentAt) : new Date(),
      deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : null,
      errorCode: dto.errorCode,
      errorMessage: dto.errorMessage,
      costAmount: Number(dto.costAmount) || 0,
      costCurrency: dto.costCurrency ?? 'USD',
      createdAt: null,
      updatedAt: null
    };
  }

  private static mapStringToNotificationChannel(channel: string): NotificationChannelEnum {
    const channelKey = Object.keys(NotificationChannelEnum).find(
      key => NotificationChannelEnum[key as keyof typeof NotificationChannelEnum] === channel
    );

    if (channelKey) {
      return NotificationChannelEnum[channelKey as keyof typeof NotificationChannelEnum];
    }

    console.warn(`Invalid notification channel received: ${channel}, defaulting to EMAIL`);
    return NotificationChannelEnum.EMAIL;
  }

  private static mapStringToAttemptStatus(status: string): AttemptStatusEnum {
    const statusKey = Object.keys(AttemptStatusEnum).find(
      key => AttemptStatusEnum[key as keyof typeof AttemptStatusEnum] === status
    );

    if (statusKey) {
      return AttemptStatusEnum[statusKey as keyof typeof AttemptStatusEnum];
    }

    console.warn(`Invalid attempt status received: ${status}, defaulting to PENDING`);
    return AttemptStatusEnum.PENDING;
  }

  private static mapStringToProviderType(provider: string): ProviderTypeEnum {
    const providerKey = Object.keys(ProviderTypeEnum).find(
      key => ProviderTypeEnum[key as keyof typeof ProviderTypeEnum] === provider
    );

    if (providerKey) {
      return ProviderTypeEnum[providerKey as keyof typeof ProviderTypeEnum];
    }

    console.warn(`Invalid provider type received: ${provider}, defaulting to LOCAL`);
    return ProviderTypeEnum.LOCAL;
  }
}
