import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {inject} from '@angular/core';
import {environment} from '../../environments/environment';

export abstract class BaseService {
  protected httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  protected http: HttpClient = inject(HttpClient);

  protected basePath: string = `${environment.apiUrl}`;

  protected resourceEndpoint: string = '/resources';

  protected handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Error:', error);
    return throwError(() => error);
  }

  protected resourcePath(): string {
    return `${this.basePath}${this.resourceEndpoint}`;
  }
}
