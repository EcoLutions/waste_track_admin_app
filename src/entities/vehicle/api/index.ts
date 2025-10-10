export type { VehicleResponse } from './types/vehicle-response.type';
export type { CreateVehicleRequest } from './types/create-vehicle-request.type';
export type { UpdateVehicleRequest } from './types/update-vehicle-request.type';

// Response mappers (DTO → Entity)
export { VehicleEntityFromResponseMapper } from './mappers/vehicle-entity-from-response.mapper';

// Request mappers (Entity → DTO)
export { CreateVehicleRequestFromEntityMapper } from './mappers/create-vehicle-request-from-entity.mapper';
export { UpdateVehicleRequestFromEntityMapper } from './mappers/update-vehicle-request-from-entity.mapper';

// Services
export { VehicleService } from './services/vehicle.service';
