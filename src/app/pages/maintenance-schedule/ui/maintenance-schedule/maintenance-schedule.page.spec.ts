import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceSchedulePage } from './maintenance-schedule.page';

describe('MaintenanceSchedulePage', () => {
  let component: MaintenanceSchedulePage;
  let fixture: ComponentFixture<MaintenanceSchedulePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceSchedulePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceSchedulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
