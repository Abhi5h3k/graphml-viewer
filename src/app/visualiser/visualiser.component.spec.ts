import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserComponent } from './visualiser.component';

describe('VisualiserComponent', () => {
  let component: VisualiserComponent;
  let fixture: ComponentFixture<VisualiserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
