import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRoutesPage } from './active-routes.page';

describe('ActiveRoutesPage', () => {
  let component: ActiveRoutesPage;
  let fixture: ComponentFixture<ActiveRoutesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveRoutesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveRoutesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
