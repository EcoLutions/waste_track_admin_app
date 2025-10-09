import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { WaypointEntity } from '../../model';
import { WaypointResponse } from '../types/waypoint-response.type';
import { CreateWaypointRequest } from '../types/create-waypoint-request.type';
import { UpdateWaypointRequest } from '../types/update-waypoint-request.type';
import { WaypointEntityFromResponseMapper } from '../mappers/waypoint-entity-from-response.mapper';
import { CreateWaypointRequestFromEntityMapper } from '../mappers/create-waypoint-request-from-entity.mapper';
import { UpdateWaypointRequestFromEntityMapper } from '../mappers/update-waypoint-request-from-entity.mapper';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WaypointService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'waypoints';
  }

  getAll(): Observable<WaypointEntity[]> {
    return this.http.get<WaypointResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: WaypointResponse[]) => responses.map(r => WaypointEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<WaypointEntity> {
    return this.http.get<WaypointResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: WaypointResponse) => WaypointEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: WaypointEntity): Observable<WaypointEntity> {
    const request: CreateWaypointRequest = CreateWaypointRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<WaypointResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: WaypointResponse) => WaypointEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: WaypointEntity): Observable<WaypointEntity> {
    const request: UpdateWaypointRequest = UpdateWaypointRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<WaypointResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: WaypointResponse) => WaypointEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError),
      retry(2)
    );
  }
}
