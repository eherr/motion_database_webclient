import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableRowComponent } from './editable-row.component';

describe('EditableRowComponent', () => {
  let component: EditableRowComponent;
  let fixture: ComponentFixture<EditableRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditableRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
