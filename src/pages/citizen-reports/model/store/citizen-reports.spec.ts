import { TestBed } from '@angular/core/testing';

import { CitizenReports } from './citizen-reports.store';

describe('CitizenReports', () => {
  let service: CitizenReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitizenReports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
