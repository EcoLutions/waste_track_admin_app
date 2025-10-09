import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { catchError } from 'rxjs/operators';
import {ReportEntity} from '../../model';
import {ReportResponse} from '../types/report-response.type';
import {ReportEntityFromResponseMapper} from '../mappers/report-entity-from-response.mapper';
import {CreateReportRequest} from '../types/create-report-request.type';
import {CreateReportRequestFromEntityMapper} from '../mappers/create-report-request-from-entity.mapper';
import {UpdateReportRequest} from '../types/update-report-request.type';
import {UpdateReportRequestFromEntityMapper} from '../mappers/update-report-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'reports';
  }

  getAll(): Observable<ReportEntity[]> {
    return this.http.get<ReportResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: ReportResponse[]) => responses.map(r => ReportEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<ReportEntity> {
    return this.http.get<ReportResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: ReportResponse) => ReportEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: ReportEntity): Observable<ReportEntity> {
    const request: CreateReportRequest = CreateReportRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<ReportResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: ReportResponse) => ReportEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, entity: ReportEntity): Observable<ReportEntity> {
    const request: UpdateReportRequest = UpdateReportRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<ReportResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: ReportResponse) => ReportEntityFromResponseMapper.fromDtoToEntity(response)),
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
