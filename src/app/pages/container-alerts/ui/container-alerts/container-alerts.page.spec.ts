import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerAlertsPage } from './container-alerts.page';

describe('ContainerAlertsPage', () => {
  let component: ContainerAlertsPage;
  let fixture: ComponentFixture<ContainerAlertsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerAlertsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerAlertsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
