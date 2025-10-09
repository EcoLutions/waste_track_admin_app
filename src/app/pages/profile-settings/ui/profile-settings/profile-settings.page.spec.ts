import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsPage } from './profile-settings.page';

describe('ProfileSettingsPage', () => {
  let component: ProfileSettingsPage;
  let fixture: ComponentFixture<ProfileSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSettingsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
