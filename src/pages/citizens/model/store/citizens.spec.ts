import { TestBed } from '@angular/core/testing';

import { Citizens } from './citizens.store';

describe('Citizens', () => {
  let service: Citizens;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Citizens);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
