import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteOptimizerPage } from './route-optimizer.page';

describe('RouteOptimizerPage', () => {
  let component: RouteOptimizerPage;
  let fixture: ComponentFixture<RouteOptimizerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteOptimizerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteOptimizerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
