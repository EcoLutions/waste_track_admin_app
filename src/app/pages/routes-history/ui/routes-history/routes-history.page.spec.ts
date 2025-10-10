import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesHistoryPage } from './routes-history.page';

describe('RoutesHistoryPage', () => {
  let component: RoutesHistoryPage;
  let fixture: ComponentFixture<RoutesHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutesHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
