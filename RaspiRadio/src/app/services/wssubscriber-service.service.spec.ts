import { TestBed } from '@angular/core/testing';

import { WSSubscriberServiceService } from './wssubscriber-service.service';

describe('WSSubscriberServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WSSubscriberServiceService = TestBed.get(WSSubscriberServiceService);
    expect(service).toBeTruthy();
  });
});
