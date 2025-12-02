import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitizensPage } from './citizens.page';

describe('CitizensPage', () => {
  let component: CitizensPage;
  let fixture: ComponentFixture<CitizensPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizensPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitizensPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
