import { TestBed } from '@angular/core/testing';

import { ManageReports } from './manage-reports.store';

describe('CitizenReports', () => {
  let service: ManageReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageReports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
