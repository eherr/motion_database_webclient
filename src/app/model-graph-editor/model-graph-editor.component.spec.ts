import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelGraphEditorComponent } from './model-graph-editor.component';

describe('ModelGraphEditorComponent', () => {
  let component: ModelGraphEditorComponent;
  let fixture: ComponentFixture<ModelGraphEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelGraphEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelGraphEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
