import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { BaseService } from '../../../../shared';
import { DriverEntity } from '../../model';
import { DriverResponse } from '../types/driver-response.type';
import { CreateDriverRequest } from '../types/create-driver-request.type';
import { UpdateDriverRequest } from '../types/update-driver-request.type';
import { DriverEntityFromResponseMapper } from '../mappers/driver-entity-from-response.mapper';
import { CreateDriverRequestFromEntityMapper } from '../mappers/create-driver-request-from-entity.mapper';
import { UpdateDriverRequestFromEntityMapper } from '../mappers/update-driver-request-from-entity.mapper';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DriverService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'drivers';
  }

  getAll(): Observable<DriverEntity[]> {
    return this.http.get<DriverResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: DriverResponse[]) => responses.map(r => DriverEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
      retry(2)
    );
  }

  getById(id: string): Observable<DriverEntity> {
    return this.http.get<DriverResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: DriverResponse) => DriverEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  getAllByDistrictId(districtId: string): Observable<DriverEntity[]> {
    return this.http.get<DriverResponse[]>(`${this.resourcePath()}/district/${districtId}`, this.httpOptions).pipe(
      map((responses: DriverResponse[]) => responses.map(r => DriverEntityFromResponseMapper.fromDtoToEntity(r))),
      catchError(this.handleError),
    )
  }

  create(driver: DriverEntity): Observable<DriverEntity> {
    const request: CreateDriverRequest = CreateDriverRequestFromEntityMapper.fromEntityToDto(driver);

    return this.http.post<DriverResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: DriverResponse) => DriverEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError),
      retry(2)
    );
  }

  update(id: string, driver: DriverEntity): Observable<DriverEntity> {
    const request: UpdateDriverRequest = UpdateDriverRequestFromEntityMapper.fromEntityToDto(driver);

    return this.http.put<DriverResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: DriverResponse) => DriverEntityFromResponseMapper.fromDtoToEntity(response)),
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
