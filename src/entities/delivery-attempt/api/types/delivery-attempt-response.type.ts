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
  costAmount: number | null;
  costCurrency: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
