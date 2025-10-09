import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDashboardPage } from './compliance-dashboard.page';

describe('ComplianceDashboardPage', () => {
  let component: ComplianceDashboardPage;
  let fixture: ComponentFixture<ComplianceDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceDashboardPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
