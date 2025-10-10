import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {AuthStore} from '../../../../../shared';
import {Router} from '@angular/router';
import {RolesEnum} from '../../../../../entities';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  standalone: true,
  templateUrl: './unauthorized.page.html',
  styleUrl: './unauthorized.page.css'
})
export class UnauthorizedPage implements OnInit{
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  isVisible = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  attemptedUrl = signal<string>('');
  username = computed(() => this.authStore.username() || 'Usuario');
  userRoles = computed(() => this.authStore.userRoles());
  isAuthenticated = computed(() => this.authStore.isAuthenticated());
  isMunicipalAdmin = computed(() => this.authStore.isAdmin());

  userTypeMessage = computed(() => {
    const roles = this.userRoles();

    if (roles.some(r => r.name === RolesEnum.ROLE_CITIZEN)) {
      return {
        type: 'Ciudadano',
        icon: 'pi-user',
        message: 'Este portal web está diseñado exclusivamente para administradores municipales. Como ciudadano, puedes acceder a nuestros servicios a través de la aplicación móvil.',
        color: '#3b82f6'
      };
    }

    if (roles.some(r => r.name === RolesEnum.ROLE_DRIVER)) {
      return {
        type: 'Conductor',
        icon: 'pi-car',
        message: 'Este portal web está diseñado exclusivamente para administradores municipales. Como conductor, puedes gestionar tus rutas a través de la aplicación móvil.',
        color: '#8b5cf6'
      };
    }

    if (roles.some(r => r.name === RolesEnum.ROLE_SYSTEM_ADMINISTRATOR)) {
      return {
        type: 'Administrador de Sistema',
        icon: 'pi-shield',
        message: 'No tienes permisos para acceder a esta sección específica. Contacta al administrador principal si necesitas acceso.',
        color: '#dc2626'
      };
    }

    return {
      type: 'Usuario',
      icon: 'pi-user',
      message: 'No tienes los permisos necesarios para acceder al sistema web. Por favor, contacta con el administrador.',
      color: '#6b7280'
    };
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']).then(() => {});
      return;
    }
    setTimeout(() => this.isVisible.set(true), 100);

    const state = history.state;
    if (state?.attemptedUrl) {
      this.attemptedUrl.set(state.attemptedUrl);
    }
  }

  async handleSignOut(): Promise<void> {
    this.isLoading.set(true);

    try {
      this.authStore.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.isLoading.set(false);
    }
  }

  contactSupport(): void {
    // TODO: Implements contact support functionality
  }
}
