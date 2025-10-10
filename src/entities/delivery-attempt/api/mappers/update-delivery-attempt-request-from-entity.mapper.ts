import { DeliveryAttemptEntity } from '../../model';
import { UpdateDeliveryAttemptRequest } from '../types/update-delivery-attempt-request.type';

export class UpdateDeliveryAttemptRequestFromEntityMapper {
  static fromEntityToDto(entity: DeliveryAttemptEntity): UpdateDeliveryAttemptRequest {
    return {
      deliveryAttemptId: entity.id,
      requestId: entity.requestId,
      channel: entity.channel,
      provider: entity.provider,
      providerMessageId: entity.providerMessageId,
      status: entity.status,
      attemptNumber: entity.attemptNumber,
      canRetry: entity.canRetry,
      sentAt: entity.sentAt.toISOString(),
      deliveredAt: entity.deliveredAt?.toISOString() ?? null,
      errorCode: entity.errorCode,
      errorMessage: entity.errorMessage,
      costAmount: entity.costAmount.toString(),
      costCurrency: entity.costCurrency
    };
  }
}
