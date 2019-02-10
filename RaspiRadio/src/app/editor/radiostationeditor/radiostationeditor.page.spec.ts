import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiostationeditorPage } from './radiostationeditor.page';

describe('RadiostationeditorPage', () => {
  let component: RadiostationeditorPage;
  let fixture: ComponentFixture<RadiostationeditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiostationeditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiostationeditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
