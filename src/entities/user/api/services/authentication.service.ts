import {Injectable} from '@angular/core';
import {map, Observable, retry} from 'rxjs';
import {BaseService} from '../../../../shared';
import {UserEntity} from '../../model';
import {AuthenticatedUserResponse} from '../types/authenticated-user-response.type';
import {SignInRequest} from '../types/sign-in-request.type';
import {AuthenticatedUserFromResponseMapper} from '../mappers/authenticated-user-from-response.mapper';
import {
  SignInCredentials,
  SignInRequestFromCredentialsMapper
} from '../mappers/sign-in-request-from-credentials.mapper';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'authentication';
  }

  signIn(credentials: SignInCredentials): Observable<UserEntity> {
    const request: SignInRequest = SignInRequestFromCredentialsMapper.fromCredentialsToDto(credentials);

    return this.http.post<AuthenticatedUserResponse>(`${this.resourcePath()}/sign-in`, request, this.httpOptions).pipe(
      map((response: AuthenticatedUserResponse) => AuthenticatedUserFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<UserEntity> {
    return this.http.get<AuthenticatedUserResponse>(`${this.resourcePath()}/me`, this.httpOptions).pipe(
      map((response: AuthenticatedUserResponse) => AuthenticatedUserFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }
}
