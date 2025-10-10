/**
 * Response DTO for delivery attempt data
 * Corresponds to: DeliveryAttemptResource.java
 *
 * @see DeliveryAttemptResource.java in backend
 */
export interface DeliveryAttemptResponse {
  id: string | null;
  requestId: string | null;
  channel: string | null;
  provider: string | null;
  providerMessageId: string | null;
  status: string | null;
  attemptNumber: number | null;
  canRetry: boolean | null;
  sentAt: string | null; // LocalDateTime → ISO string
  deliveredAt: string | null; // LocalDateTime → ISO string
  errorCode: string | null;
  errorMessage: string | null;
  costAmount: string | null;
  costCurrency: string | null;
}