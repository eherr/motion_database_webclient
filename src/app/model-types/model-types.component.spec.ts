import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelTypesComponent } from './model-types.component';

describe('ModelTypesComponent', () => {
  let component: ModelTypesComponent;
  let fixture: ComponentFixture<ModelTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelTypesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
