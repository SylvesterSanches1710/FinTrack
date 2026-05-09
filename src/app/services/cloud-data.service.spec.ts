import { TestBed } from '@angular/core/testing';

import { CloudDataService } from './cloud-data.service';

describe('CloudDataService', () => {
  let service: CloudDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
