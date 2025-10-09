import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { catchError } from 'rxjs/operators';
import {PhotoResponse} from '../types/photo-response.type';
import {PhotoEntity} from '../../model';
import {PhotoEntityFromResponseMapper} from '../mappers/photo-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class PhotoService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'photos';
  }

  getAll(): Observable<PhotoEntity[]> {
    return this.http.get<PhotoResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: PhotoResponse[]) => responses.map(r => PhotoEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<PhotoEntity> {
    return this.http.get<PhotoResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: PhotoResponse) => PhotoEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: PhotoEntity): Observable<PhotoEntity> {
    return this.http.post<PhotoResponse>(
      this.resourcePath(),
      entity,
      this.httpOptions
    ).pipe(
      map((response: PhotoResponse) => PhotoEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: PhotoEntity): Observable<PhotoEntity> {
    return this.http.put<PhotoResponse>(
      `${this.resourcePath()}/${id}`,
      entity,
      this.httpOptions
    ).pipe(
      map((response: PhotoResponse) => PhotoEntityFromResponseMapper.fromDtoToEntity(response)),
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
