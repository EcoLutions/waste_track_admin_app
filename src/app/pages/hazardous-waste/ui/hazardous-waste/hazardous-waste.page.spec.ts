import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HazardousWastePage } from './hazardous-waste.page';

describe('HazardousWastePage', () => {
  let component: HazardousWastePage;
  let fixture: ComponentFixture<HazardousWastePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HazardousWastePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HazardousWastePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
