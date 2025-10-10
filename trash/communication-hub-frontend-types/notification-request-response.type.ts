/**
 * Response DTO for notification request data
 * Corresponds to: NotificationRequestResource.java
 *
 * @see NotificationRequestResource.java in backend
 */
export interface NotificationRequestResponse {
  id: string | null;
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
  status: string | null;
  sentAt: string | null; // LocalDateTime → ISO string
  failureReason: string | null;
}