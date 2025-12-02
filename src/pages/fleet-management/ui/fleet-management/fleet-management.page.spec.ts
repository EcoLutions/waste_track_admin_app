import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetManagementPage } from './fleet-management.page';

describe('FleetManagementPage', () => {
  let component: FleetManagementPage;
  let fixture: ComponentFixture<FleetManagementPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetManagementPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
