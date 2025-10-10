/**
 * Request DTO for updating a notification request
 * Corresponds to: UpdateNotificationRequestResource.java
 *
 * @see UpdateNotificationRequestResource.java in backend
 */
export interface UpdateNotificationRequest {
  notificationRequestId: string | null;
  sourceContext: string | null;
  recipientId: string | null;
  recipientType: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  messageType: string | null;
  templateId: string | null;
  templateData: Record<string, string> | null;
  channels: string[] | null;
  priority: string | null;
  scheduledFor: string | null; // LocalDateTime → ISO string
  expiresAt: string | null; // LocalDateTime → ISO string
}