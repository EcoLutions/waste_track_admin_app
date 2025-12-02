import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared';
import { RouteEntity } from '../../model';
import { RouteResponse } from '../types/route-response.type';
import { CreateRouteRequest } from '../types/create-route-request.type';
import { UpdateRouteRequest } from '../types/update-route-request.type';
import { RouteEntityFromResponseMapper } from '../mappers/route-entity-from-response.mapper';
import { CreateRouteRequestFromEntityMapper } from '../mappers/create-route-request-from-entity.mapper';
import { UpdateRouteRequestFromEntityMapper } from '../mappers/update-route-request-from-entity.mapper';
import { catchError } from 'rxjs/operators';
import {RouteFilters} from '../filters/route.filters';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RouteService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'routes';
  }

  getAll(filters?: RouteFilters): Observable<RouteEntity[]> {
    let params = new HttpParams();

    if(filters) {
      if(filters.districtId) params = params.append('districtId', filters.districtId);
      if(filters.driverId) params = params.append('driverId', filters.driverId);
      if(filters.vehicleId) params = params.append('vehicleId', filters.vehicleId);
      if(filters.status) params = params.append('status', filters.status);
      if(filters.statuses && filters.statuses.length > 0) {
        filters.statuses.forEach(s => params = params.append('statuses', s));
      }
    }

    return this.http.get<RouteResponse[]>(this.resourcePath(), { ...this.httpOptions, params }).pipe(
      map((responses: RouteResponse[]) => responses.map(r => RouteEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<RouteEntity> {
    return this.http.get<RouteResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: RouteResponse) => RouteEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  getAllActiveByDistrictId(districtId: string): Observable<RouteEntity[]> {
    return this.http.get<RouteResponse[]>(`${this.resourcePath()}/district/${districtId}/active`, this.httpOptions).pipe(
      map((responses: RouteResponse[]) => responses.map(r => RouteEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
    )
  }

  create(entity: RouteEntity): Observable<RouteEntity> {
    const request: CreateRouteRequest = CreateRouteRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<RouteResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: RouteResponse) => RouteEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: RouteEntity): Observable<RouteEntity> {
    const request: UpdateRouteRequest = UpdateRouteRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<RouteResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: RouteResponse) => RouteEntityFromResponseMapper.fromDtoToEntity(response)),
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
