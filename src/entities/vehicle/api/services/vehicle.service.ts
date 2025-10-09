import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { VehicleEntity } from '../../model';
import { VehicleResponse } from '../types/vehicle-response.type';
import { CreateVehicleRequest } from '../types/create-vehicle-request.type';
import { UpdateVehicleRequest } from '../types/update-vehicle-request.type';
import { VehicleEntityFromResponseMapper } from '../mappers/vehicle-entity-from-response.mapper';
import { CreateVehicleRequestFromEntityMapper } from '../mappers/create-vehicle-request-from-entity.mapper';
import { UpdateVehicleRequestFromEntityMapper } from '../mappers/update-vehicle-request-from-entity.mapper';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehicleService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'vehicles';
  }

  getAll(): Observable<VehicleEntity[]> {
    return this.http.get<VehicleResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: VehicleResponse[]) => responses.map(r => VehicleEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<VehicleEntity> {
    return this.http.get<VehicleResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: VehicleResponse) => VehicleEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(vehicle: VehicleEntity): Observable<VehicleEntity> {
    const request: CreateVehicleRequest = CreateVehicleRequestFromEntityMapper.fromEntityToDto(vehicle);

    return this.http.post<VehicleResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: VehicleResponse) => VehicleEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, vehicle: VehicleEntity): Observable<VehicleEntity> {
    const request: UpdateVehicleRequest = UpdateVehicleRequestFromEntityMapper.fromEntityToDto(vehicle);

    return this.http.put<VehicleResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: VehicleResponse) => VehicleEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError),
      retry(2)
    );
  }
}
