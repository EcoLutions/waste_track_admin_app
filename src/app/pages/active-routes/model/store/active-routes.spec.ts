import { TestBed } from '@angular/core/testing';

import { ActiveRoutes } from './active-routes';

describe('ActiveRoutes', () => {
  let service: ActiveRoutes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveRoutes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
