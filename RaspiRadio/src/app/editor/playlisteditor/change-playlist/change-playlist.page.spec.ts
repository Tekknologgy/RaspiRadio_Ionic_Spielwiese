import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePlaylistPage } from './change-playlist.page';

describe('ChangePlaylistPage', () => {
  let component: ChangePlaylistPage;
  let fixture: ComponentFixture<ChangePlaylistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePlaylistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePlaylistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
