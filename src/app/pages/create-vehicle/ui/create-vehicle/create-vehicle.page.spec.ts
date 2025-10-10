import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVehiclePage } from './create-vehicle.page';

describe('CreateVehiclePage', () => {
  let component: CreateVehiclePage;
  let fixture: ComponentFixture<CreateVehiclePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVehiclePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateVehiclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
