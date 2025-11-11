import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteOptimizationPage } from './route-optimization.page';

describe('RouteOptimizationPage', () => {
  let component: RouteOptimizationPage;
  let fixture: ComponentFixture<RouteOptimizationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteOptimizationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteOptimizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
