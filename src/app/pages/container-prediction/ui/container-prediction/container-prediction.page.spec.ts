import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerPredictionPage } from './container-prediction.page';

describe('ContainerPredictionPage', () => {
  let component: ContainerPredictionPage;
  let fixture: ComponentFixture<ContainerPredictionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerPredictionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerPredictionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
