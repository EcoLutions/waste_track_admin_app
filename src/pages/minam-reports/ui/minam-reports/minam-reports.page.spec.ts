import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinamReportsPage } from './minam-reports.page';

describe('MinamReportsPage', () => {
  let component: MinamReportsPage;
  let fixture: ComponentFixture<MinamReportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinamReportsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinamReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
