import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalCostsPage } from './operational-costs.page';

describe('OperationalCostsPage', () => {
  let component: OperationalCostsPage;
  let fixture: ComponentFixture<OperationalCostsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalCostsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalCostsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
