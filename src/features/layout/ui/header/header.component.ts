import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderStore } from '../../model/header.store';
import { AuthStore } from '../../../../shared';

interface UserInfo {
  name: string;
  initials: string;
  role: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
}

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  readonly headerStore = inject(HeaderStore);
  readonly authStore = inject(AuthStore);

  // Computed properties from store
  userInfo = computed<UserInfo | null>(() => this.headerStore.userInfo());
  isLoading = computed(() => this.headerStore.isLoading());
  hasError = computed(() => this.headerStore.hasError());

  // Outputs
  toggleSidebar = output<void>();
  logout = output<void>();

  constructor() {
    // Cargar datos del perfil cuando el componente se inicialice
    if (this.authStore.isAuthenticated()) {
      this.headerStore.loadUserProfile();
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.authStore.signOut();
    this.logout.emit();
  }

  goToProfile(): void {
    this.router.navigate(['/settings/profile']);
  }
}
