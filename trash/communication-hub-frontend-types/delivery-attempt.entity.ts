/**
 * DeliveryAttempt domain entity for frontend
 * Based on: DeliveryAttempt.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see DeliveryAttempt.java in backend
 */
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
}