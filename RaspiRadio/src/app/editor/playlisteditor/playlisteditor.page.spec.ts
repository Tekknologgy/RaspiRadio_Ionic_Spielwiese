import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylisteditorPage } from './playlisteditor.page';

describe('PlaylisteditorPage', () => {
  let component: PlaylisteditorPage;
  let fixture: ComponentFixture<PlaylisteditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylisteditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylisteditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
