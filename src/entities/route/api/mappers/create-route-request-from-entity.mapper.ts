import { RouteEntity } from '../../model';
import { CreateRouteRequest } from '../types/create-route-request.type';

export class CreateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): CreateRouteRequest {
    // Convert Date to ISO_LOCAL_DATE_TIME format (without timezone)
    // Backend expects: "2025-11-29T14:11:00" (not "2025-11-29T14:11:00.000Z")
    const scheduledDate = entity.scheduledStartAt
      ? this.toISOLocalDateTime(entity.scheduledStartAt)
      : null;

    return {
      districtId: entity.districtId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      routeType: entity.routeType,
      scheduledDate,
    };
  }

  /**
   * Converts a Date object to ISO_LOCAL_DATE_TIME format (without timezone)
   * Example: "2025-11-29T14:11:00"
   */
  private static toISOLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
