import { Injectable } from '@angular/core';
import { Observable, map, retry } from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { catchError } from 'rxjs/operators';
import {UserProfileResponse} from '../types/user-profile-response.type';
import {UserProfileEntity} from '../../model';
import {UserProfileEntityFromResponseMapper} from '../mappers/user-profile-entity-from-response.mapper';
import {CreateUserProfileRequest} from '../types/create-user-profile-request.type';
import {CreateUserProfileRequestFromEntityMapper} from '../mappers/create-user-profile-request-from-entity.mapper';
import {UpdateUserProfileRequest} from '../types/update-user-profile-request.type';
import {UpdateUserProfileRequestFromEntityMapper} from '../mappers/update-user-profile-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'user-profiles';
  }

  getAll(): Observable<UserProfileEntity[]> {
    return this.http.get<UserProfileResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: UserProfileResponse[]) => responses.map(r => UserProfileEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<UserProfileEntity> {
    return this.http.get<UserProfileResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: UserProfileResponse) => UserProfileEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  create(entity: UserProfileEntity): Observable<UserProfileEntity> {
    const request: CreateUserProfileRequest = CreateUserProfileRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<UserProfileResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: UserProfileResponse) => UserProfileEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: UserProfileEntity): Observable<UserProfileEntity> {
    const request: UpdateUserProfileRequest = UpdateUserProfileRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<UserProfileResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: UserProfileResponse) => UserProfileEntityFromResponseMapper.fromDtoToEntity(response)),
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
