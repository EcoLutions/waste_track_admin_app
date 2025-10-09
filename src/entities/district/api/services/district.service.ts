import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { DistrictEntity } from '../../model';
import { DistrictResponse } from '../types/district-response.type';
import { CreateDistrictRequest } from '../types/create-district-request.type';
import { UpdateDistrictRequest } from '../types/update-district-request.type';
import { DistrictEntityFromResponseMapper } from '../mappers/district-entity-from-response.mapper';
import { CreateDistrictRequestFromEntityMapper } from '../mappers/create-district-request-from-entity.mapper';
import { UpdateDistrictRequestFromEntityMapper } from '../mappers/update-district-request-from-entity.mapper';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DistrictService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'districts';
  }

  getAll(): Observable<DistrictEntity[]> {
    return this.http.get<DistrictResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: DistrictResponse[]) => responses.map(r => DistrictEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<DistrictEntity> {
    return this.http.get<DistrictResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: DistrictResponse) => DistrictEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(district: DistrictEntity): Observable<DistrictEntity> {
    const request: CreateDistrictRequest = CreateDistrictRequestFromEntityMapper.fromEntityToDto(district);

    return this.http.post<DistrictResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: DistrictResponse) => DistrictEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, district: DistrictEntity): Observable<DistrictEntity> {
    const request: UpdateDistrictRequest = UpdateDistrictRequestFromEntityMapper.fromEntityToDto(district);

    return this.http.put<DistrictResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: DistrictResponse) => DistrictEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError),
      retry(2)
    );
  }
}
