/**
 * Message type enumeration
 * Corresponds to: MessageType.java enum
 *
 * @see MessageType.java in backend
 */
export enum MessageTypeEnum {
  ROUTE_ASSIGNED = 'route_assigned',
  ROUTE_STARTED = 'route_started',
  ROUTE_COMPLETED = 'route_completed',
  CONTAINER_FULL = 'container_full',
  CONTAINER_DAMAGED = 'container_damaged',
  SYSTEM_ALERT = 'system_alert',
  MAINTENANCE_REMINDER = 'maintenance_reminder'
}