import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleAssignmentPage } from './vehicle-assignment.page';

describe('VehicleAssignmentPage', () => {
  let component: VehicleAssignmentPage;
  let fixture: ComponentFixture<VehicleAssignmentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleAssignmentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleAssignmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
