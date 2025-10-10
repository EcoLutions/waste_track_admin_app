import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared';
import { catchError } from 'rxjs/operators';
import {UpdateContainerRequest} from '../types/update-container-request.type';
import {ContainerEntity} from '../../model';
import {ContainerResponse} from '../types/container-response.type';
import {ContainerEntityFromResponseMapper} from '../mappers/container-entity-from-response.mapper';
import {CreateContainerRequest} from '../types/create-container-request.type';
import {CreateContainerRequestFromEntityMapper} from '../mappers/create-container-request-from-entity.mapper';
import {UpdateContainerRequestFromEntityMapper} from '../mappers/update-container-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class ContainerService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'containers';
  }

  getAll(): Observable<ContainerEntity[]> {
    return this.http.get<ContainerResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: ContainerResponse[]) => responses.map(r => ContainerEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<ContainerEntity> {
    return this.http.get<ContainerResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: ContainerResponse) => ContainerEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  getAllByDistrictId(districtId: string): Observable<ContainerEntity[]> {
    return this.http.get<ContainerResponse[]>(`${this.resourcePath()}/district/${districtId}`, this.httpOptions).pipe(
      map((responses: ContainerResponse[]) => responses.map(r => ContainerEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
    )
  }

  create(entity: ContainerEntity): Observable<ContainerEntity> {
    const request: CreateContainerRequest = CreateContainerRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<ContainerResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: ContainerResponse) => ContainerEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: ContainerEntity): Observable<ContainerEntity> {
    const request: UpdateContainerRequest = UpdateContainerRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<ContainerResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: ContainerResponse) => ContainerEntityFromResponseMapper.fromDtoToEntity(response)),
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
