import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateContainerPage } from './create-container.page';

describe('CreateContainerPage', () => {
  let component: CreateContainerPage;
  let fixture: ComponentFixture<CreateContainerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContainerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContainerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
