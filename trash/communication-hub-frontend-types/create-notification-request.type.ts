/**
 * Request DTO for creating a new notification request
 * Corresponds to: CreateNotificationRequestResource.java
 *
 * @see CreateNotificationRequestResource.java in backend
 */
export interface CreateNotificationRequest {
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