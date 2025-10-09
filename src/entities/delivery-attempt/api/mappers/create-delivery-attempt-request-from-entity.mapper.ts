import { DeliveryAttemptEntity } from '../../model';
import { CreateDeliveryAttemptRequest } from '../types/create-delivery-attempt-request.type';


export class CreateDeliveryAttemptRequestFromEntityMapper {
  static fromEntityToDto(entity: DeliveryAttemptEntity): CreateDeliveryAttemptRequest {
    return {
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
