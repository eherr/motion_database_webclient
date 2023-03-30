import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionBrowserComponent } from './collection-browser.component';

describe('CollectionBrowserComponent', () => {
  let component: CollectionBrowserComponent;
  let fixture: ComponentFixture<CollectionBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionBrowserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
