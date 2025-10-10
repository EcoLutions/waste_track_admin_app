/**
 * Response DTO for message template data
 * Corresponds to: MessageTemplateResource.java
 *
 * @see MessageTemplateResource.java in backend
 */
export interface MessageTemplateResponse {
  id: string | null;
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
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}