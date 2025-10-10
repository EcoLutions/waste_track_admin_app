import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { catchError } from 'rxjs/operators';
import {SensorReadingEntity} from '../../model';
import {SensorReadingResponse} from '../types/sensor-reading-response.type';
import {SensorReadingEntityFromResponseMapper} from '../mappers/sensor-reading-entity-from-response.mapper';
import {CreateSensorReadingRequest} from '../types/create-sensor-reading-request.type';
import {CreateSensorReadingRequestFromEntityMapper} from '../mappers/create-sensor-reading-request-from-entity.mapper';
import {UpdateSensorReadingRequest} from '../types/update-sensor-reading-request.type';
import {UpdateSensorReadingRequestFromEntityMapper} from '../mappers/update-sensor-reading-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class SensorReadingService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'sensor-readings';
  }

  getAll(): Observable<SensorReadingEntity[]> {
    return this.http.get<SensorReadingResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: SensorReadingResponse[]) => responses.map(r => SensorReadingEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<SensorReadingEntity> {
    return this.http.get<SensorReadingResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: SensorReadingResponse) => SensorReadingEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: SensorReadingEntity): Observable<SensorReadingEntity> {
    const request: CreateSensorReadingRequest = CreateSensorReadingRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<SensorReadingResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: SensorReadingResponse) => SensorReadingEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: SensorReadingEntity): Observable<SensorReadingEntity> {
    const request: UpdateSensorReadingRequest = UpdateSensorReadingRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<SensorReadingResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: SensorReadingResponse) => SensorReadingEntityFromResponseMapper.fromDtoToEntity(response)),
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
