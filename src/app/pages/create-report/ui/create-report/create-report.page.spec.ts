import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReportPage } from './create-report.page';

describe('CreateReportPage', () => {
  let component: CreateReportPage;
  let fixture: ComponentFixture<CreateReportPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReportPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
