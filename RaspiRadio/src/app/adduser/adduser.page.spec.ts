import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdduserPage } from './adduser.page';

describe('AdduserPage', () => {
  let component: AdduserPage;
  let fixture: ComponentFixture<AdduserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdduserPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdduserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
