import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { catchError } from 'rxjs/operators';
import {EvidenceEntity} from '../../model';
import {EvidenceResponse} from '../types/evidence-response.type';
import {EvidenceEntityFromResponseMapper} from '../mappers/evidence-entity-from-response.mapper';
import {CreateEvidenceRequest} from '../types/create-evidence-request.type';
import {CreateEvidenceRequestFromEntityMapper} from '../mappers/create-evidence-request-from-entity.mapper';
import {UpdateEvidenceRequest} from '../types/update-evidence-request.type';
import {UpdateEvidenceRequestFromEntityMapper} from '../mappers/update-evidence-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class EvidenceService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'evidences';
  }

  getAll(): Observable<EvidenceEntity[]> {
    return this.http.get<EvidenceResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: EvidenceResponse[]) => responses.map(r => EvidenceEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<EvidenceEntity> {
    return this.http.get<EvidenceResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: EvidenceResponse) => EvidenceEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: EvidenceEntity): Observable<EvidenceEntity> {
    const request: CreateEvidenceRequest = CreateEvidenceRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<EvidenceResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: EvidenceResponse) => EvidenceEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, entity: EvidenceEntity): Observable<EvidenceEntity> {
    const request: UpdateEvidenceRequest = UpdateEvidenceRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<EvidenceResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: EvidenceResponse) => EvidenceEntityFromResponseMapper.fromDtoToEntity(response)),
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
