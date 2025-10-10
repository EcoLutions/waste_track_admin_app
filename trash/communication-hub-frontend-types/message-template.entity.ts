/**
 * MessageTemplate domain entity for frontend
 * Based on: MessageTemplate.java (DDD Aggregate)
 *
 * NOTE: This is a plain interface with NO business logic
 * All validation and business rules are handled by the backend
 *
 * @see MessageTemplate.java in backend
 */
export interface MessageTemplateEntity {
  id: string;
  name: string;
  category: TemplateCategoryEnum;
  supportedChannels: NotificationChannelEnum[];
  emailSubject: string | null;
  emailBody: string | null;
  smsBody: string | null;
  pushTitle: string | null;
  pushBody: string | null;
  variables: string[];
  isActive: boolean;
}