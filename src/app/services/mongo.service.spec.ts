import { TestBed, inject } from '@angular/core/testing';

import { MongoService } from './mongo.service';

describe('MongoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongoService]
    });
  });

  it('should be created', inject([MongoService], (service: MongoService) => {
    expect(service).toBeTruthy();
  }));
});
