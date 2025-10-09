/**
 * Request DTO for updating a message template
 * Corresponds to: UpdateMessageTemplateResource.java
 *
 * @see UpdateMessageTemplateResource.java in backend
 */
export interface UpdateMessageTemplateRequest {
  messageTemplateId: string | null;
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