import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerSettingsPage } from './container-settings.page';

describe('ContainerSettingsPage', () => {
  let component: ContainerSettingsPage;
  let fixture: ComponentFixture<ContainerSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerSettingsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
