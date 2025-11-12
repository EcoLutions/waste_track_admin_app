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
import {SetInitialPasswordRequestType} from '../types/set-initial-password-request.type';
import {ResetPasswordRequestType} from '../types/reset-password-request.type';
import {HttpParams} from '@angular/common/http';

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

  setInitialPassword(accessToken: string, newPassword: string): Observable<void> {
    const request: SetInitialPasswordRequestType = {
      activationToken: accessToken,
      password: newPassword
    };

    return this.http.post<void>(`${this.resourcePath()}/set-initial-password`, request, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`${this.resourcePath()}/forgot-password`, null,  { ...this.httpOptions, params: params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    const request: ResetPasswordRequestType = {
      resetToken: token,
      newPassword: newPassword
    };
    return this.http.post<void>(`${this.resourcePath()}/reset-password`, request , this.httpOptions).pipe(
      retry(2),
    )
  }
}
