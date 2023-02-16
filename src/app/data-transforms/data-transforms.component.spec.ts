import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTransformsComponent } from './data-transforms.component';

describe('DataTransformsComponent', () => {
  let component: DataTransformsComponent;
  let fixture: ComponentFixture<DataTransformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTransformsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTransformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
