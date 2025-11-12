import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {AuthStore} from '../../../../shared';
import {RolesEnum} from '../../../../entities';

interface UserTypeMessage {
  type: string;
  icon: string;
  message: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.page.html',
  styleUrl: './unauthorized.page.css'
})
export class UnauthorizedPage implements OnInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly attemptedUrl = signal<string>('');

  readonly username = computed(() => this.authStore.username() || 'Usuario');
  readonly userRoles = computed(() => this.authStore.userRoles());
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());

  readonly userTypeMessage = computed((): UserTypeMessage => {
    const roles = this.userRoles();

    if (roles.some(r => r.name === RolesEnum.ROLE_CITIZEN)) {
      return {
        type: 'Ciudadano',
        icon: 'pi-user',
        message: 'Este portal web está diseñado exclusivamente para administradores municipales. Como ciudadano, puedes acceder a nuestros servicios a través de la aplicación móvil.',
        borderColor: '#10b981',
        bgColor: '#d1fae5',
        iconBg: '#6ee7b7',
        iconColor: '#047857'
      };
    }

    if (roles.some(r => r.name === RolesEnum.ROLE_DRIVER)) {
      return {
        type: 'Conductor',
        icon: 'pi-car',
        message: 'Este portal web está diseñado exclusivamente para administradores municipales. Como conductor, puedes gestionar tus rutas a través de la aplicación móvil.',
        borderColor: '#14b8a6',
        bgColor: '#ccfbf1',
        iconBg: '#5eead4',
        iconColor: '#0f766e'
      };
    }

    if (roles.some(r => r.name === RolesEnum.ROLE_SYSTEM_ADMINISTRATOR)) {
      return {
        type: 'Administrador de Sistema',
        icon: 'pi-shield',
        message: 'No tienes permisos para acceder a esta sección específica del sistema municipal. Tu acceso está limitado al panel de administración del sistema.',
        borderColor: '#f59e0b',
        bgColor: '#fef3c7',
        iconBg: '#fcd34d',
        iconColor: '#d97706'
      };
    }

    return {
      type: 'Usuario',
      icon: 'pi-user',
      message: 'No tienes los permisos necesarios para acceder a esta sección. Por favor, contacta con el administrador si consideras que esto es un error.',
      borderColor: '#6b7280',
      bgColor: '#f3f4f6',
      iconBg: '#d1d5db',
      iconColor: '#4b5563'
    };
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']).then(() => {});
      return;
    }

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
    // TODO: Implementar funcionalidad de contacto con soporte
    const email = 'soporte@wastetrack.com';
    const subject = 'Solicitud de Acceso - Sistema WasteTrack';
    const body = `Hola,%0D%0A%0D%0AMi nombre de usuario es: ${this.username()}%0D%0A%0D%0ASolicito acceso a la siguiente sección:%0D%0A${this.attemptedUrl() || 'No especificado'}%0D%0A%0D%0AGracias.`;

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
}
