import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoutePage } from './create-route.page';

describe('CreateRoutePage', () => {
  let component: CreateRoutePage;
  let fixture: ComponentFixture<CreateRoutePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoutePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
