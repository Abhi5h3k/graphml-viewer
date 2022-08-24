import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabledComponent } from './tabled.component';

describe('TabledComponent', () => {
  let component: TabledComponent;
  let fixture: ComponentFixture<TabledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
