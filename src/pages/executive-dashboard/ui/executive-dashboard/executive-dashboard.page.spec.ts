import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveDashboardPage } from './executive-dashboard.page';

describe('ExecutiveDashboardPage', () => {
  let component: ExecutiveDashboardPage;
  let fixture: ComponentFixture<ExecutiveDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveDashboardPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutiveDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
