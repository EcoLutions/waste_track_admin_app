import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerHistoryPage } from './container-history.page';

describe('ContainerHistoryPage', () => {
  let component: ContainerHistoryPage;
  let fixture: ComponentFixture<ContainerHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
