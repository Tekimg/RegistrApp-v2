import { TestBed } from '@angular/core/testing';

import { SantoralService } from './santoral.service';

describe('SantoralService', () => {
  let service: SantoralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SantoralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
