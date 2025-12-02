import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteReportsPage } from './route-reports.page';

describe('RouteReportsPage', () => {
  let component: RouteReportsPage;
  let fixture: ComponentFixture<RouteReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteReportsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
