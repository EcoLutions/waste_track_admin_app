import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { DeliveryAttemptEntity } from '../../model';
import { DeliveryAttemptResponse } from '../types/delivery-attempt-response.type';
import { CreateDeliveryAttemptRequest } from '../types/create-delivery-attempt-request.type';
import { UpdateDeliveryAttemptRequest } from '../types/update-delivery-attempt-request.type';
import { DeliveryAttemptEntityFromResponseMapper } from '../mappers/delivery-attempt-entity-from-response.mapper';
import { CreateDeliveryAttemptRequestFromEntityMapper } from '../mappers/create-delivery-attempt-request-from-entity.mapper';
import { UpdateDeliveryAttemptRequestFromEntityMapper } from '../mappers/update-delivery-attempt-request-from-entity.mapper';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAttemptService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'delivery-attempts';
  }

  getAll(): Observable<DeliveryAttemptEntity[]> {
    return this.http.get<DeliveryAttemptResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: DeliveryAttemptResponse[]) => responses.map(r => DeliveryAttemptEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<DeliveryAttemptEntity> {
    return this.http.get<DeliveryAttemptResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: DeliveryAttemptResponse) => DeliveryAttemptEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: DeliveryAttemptEntity): Observable<DeliveryAttemptEntity> {
    const request: CreateDeliveryAttemptRequest = CreateDeliveryAttemptRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<DeliveryAttemptResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: DeliveryAttemptResponse) => DeliveryAttemptEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: DeliveryAttemptEntity): Observable<DeliveryAttemptEntity> {
    const request: UpdateDeliveryAttemptRequest = UpdateDeliveryAttemptRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<DeliveryAttemptResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: DeliveryAttemptResponse) => DeliveryAttemptEntityFromResponseMapper.fromDtoToEntity(response)),
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
