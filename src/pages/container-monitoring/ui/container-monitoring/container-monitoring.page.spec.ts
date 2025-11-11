import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerMonitoringPage } from './container-monitoring.page';

describe('ContainerMonitoringPage', () => {
  let component: ContainerMonitoringPage;
  let fixture: ComponentFixture<ContainerMonitoringPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerMonitoringPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerMonitoringPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
