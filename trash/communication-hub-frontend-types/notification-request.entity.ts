/**
 * NotificationRequest domain entity for frontend
 * Based on: NotificationRequest.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see NotificationRequest.java in backend
 */
export interface NotificationRequestEntity {
  id: string;
  sourceContext: SourceContextEnum;
  recipientId: string;
  recipientType: RecipientTypeEnum;
  recipientEmail: string;
  recipientPhone: string;
  messageType: MessageTypeEnum;
  templateId: string;
  templateData: Record<string, string>;
  channels: NotificationChannelEnum[];
  priority: NotificationPriorityEnum;
  scheduledFor: Date;
  expiresAt: Date;
  status: RequestStatusEnum;
  sentAt: Date | null;
  failureReason: string | null;
}