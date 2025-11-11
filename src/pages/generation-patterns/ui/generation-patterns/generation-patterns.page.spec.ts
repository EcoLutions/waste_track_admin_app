import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationPatternsPage } from './generation-patterns.page';

describe('GenerationPatternsPage', () => {
  let component: GenerationPatternsPage;
  let fixture: ComponentFixture<GenerationPatternsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationPatternsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationPatternsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
