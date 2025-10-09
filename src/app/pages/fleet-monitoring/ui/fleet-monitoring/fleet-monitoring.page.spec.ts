import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetMonitoringPage } from './fleet-monitoring.page';

describe('FleetMonitoringPage', () => {
  let component: FleetMonitoringPage;
  let fixture: ComponentFixture<FleetMonitoringPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetMonitoringPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetMonitoringPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
