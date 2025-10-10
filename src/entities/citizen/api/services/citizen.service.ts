import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared';
import { catchError } from 'rxjs/operators';
import {CitizenEntity} from '../../model';
import {CitizenResponse} from '../types/citizen-response.type';
import {CitizenEntityFromResponseMapper} from '../mappers/citizen-entity-from-response.mapper';
import {CreateCitizenRequest} from '../types/create-citizen-request.type';
import {CreateCitizenRequestFromEntityMapper} from '../mappers/create-citizen-request-from-entity.mapper';
import {UpdateCitizenRequestFromEntityMapper} from '../mappers/update-citizen-request-from-entity.mapper';
import {UpdateCitizenRequest} from '../types/update-citizen-request.type';

@Injectable({
  providedIn: 'root'
})
export class CitizenService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'citizens';
  }

  getAll(): Observable<CitizenEntity[]> {
    return this.http.get<CitizenResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: CitizenResponse[]) => responses.map(r => CitizenEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<CitizenEntity> {
    return this.http.get<CitizenResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: CitizenResponse) => CitizenEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  getAllByDistrictId(districtId: string): Observable<CitizenEntity[]> {
    return this.http.get<CitizenResponse[]>(`${this.resourcePath()}/district/${districtId}`, this.httpOptions).pipe(
      map((responses: CitizenResponse[]) => responses.map(r => CitizenEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
    )
  }

  create(entity: CitizenEntity): Observable<CitizenEntity> {
    const request: CreateCitizenRequest = CreateCitizenRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<CitizenResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: CitizenResponse) => CitizenEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, entity: CitizenEntity): Observable<CitizenEntity> {
    const request: UpdateCitizenRequest = UpdateCitizenRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<CitizenResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: CitizenResponse) => CitizenEntityFromResponseMapper.fromDtoToEntity(response)),
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
