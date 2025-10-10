/**
 * Request DTO for creating a new message template
 * Corresponds to: CreateMessageTemplateResource.java
 *
 * @see CreateMessageTemplateResource.java in backend
 */
export interface CreateMessageTemplateRequest {
  name: string | null;
  category: string | null;
  supportedChannels: string[] | null;
  emailSubject: string | null;
  emailBody: string | null;
  smsBody: string | null;
  pushTitle: string | null;
  pushBody: string | null;
  variables: string[] | null;
  isActive: boolean | null;
}