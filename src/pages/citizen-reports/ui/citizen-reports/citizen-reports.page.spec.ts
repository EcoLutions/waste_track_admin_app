import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitizenReportsPage } from './citizen-reports.page';

describe('CitizenReportsPage', () => {
  let component: CitizenReportsPage;
  let fixture: ComponentFixture<CitizenReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenReportsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitizenReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
