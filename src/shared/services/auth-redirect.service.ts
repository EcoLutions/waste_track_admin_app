import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {RolesEnum} from '../../entities';

interface RedirectResult {
  shouldRedirect: boolean;
  message: string;
  url?: string;
  isMobileApp: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectService {
  private readonly FRONTEND_URLS: Record<string, string> = {
    [RolesEnum.ROLE_SYSTEM_ADMINISTRATOR]: 'https://admin.wastetrack.com/login',
    [RolesEnum.ROLE_MUNICIPAL_ADMINISTRATOR]: window.location.origin + '/login',
    [RolesEnum.ROLE_DRIVER]: 'wastetrack-driver://login',
    [RolesEnum.ROLE_CITIZEN]: 'wastetrack-citizen://login'
  };

  constructor(private router: Router) {}

  getRedirectStrategy(roles: string[]): RedirectResult {
    const primaryRole = this.getPrimaryRole(roles);
    const isMobileDevice = this.isMobileDevice();
    const isMobileRole = this.isMobileRole(primaryRole);

    /**
     * CASE 1: Mobile user in desktop -> just message, no redirect
     */
    if (isMobileRole && !isMobileDevice) {
      return {
        shouldRedirect: false,
        message: this.getMobileDesktopMessage(primaryRole),
        isMobileApp: true
      };
    }

    /**
     * CASE 2: Mobile user in mobile -> redirect to app
     */
    if (isMobileRole && isMobileDevice) {
      return {
        shouldRedirect: true,
        message: this.getSuccessMessage(primaryRole),
        url: this.FRONTEND_URLS[primaryRole],
        isMobileApp: true
      };
    }

    /**
     * CASE 3: Web user (System or Municipal Admin) -> redirect to web
     */
    return {
      shouldRedirect: true,
      message: this.getSuccessMessage(primaryRole),
      url: this.FRONTEND_URLS[primaryRole],
      isMobileApp: false
    };
  }

  /**
   * Execute the redirect based on the strategy
   */
  async executeRedirect(url: string, delayMs: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url.startsWith('http')) {
          // Redirección externa
          window.location.href = url;
        } else if (url.includes('://')) {
          // Deep link
          window.location.href = url;

          // Fallback si no abre la app
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { message: 'install-app-required' }
            });
          }, 3000);
        } else {
          // Navegación interna
          this.router.navigate([url]);
        }
        resolve();
      }, delayMs);
    });
  }

  /**
   * Get the primary role based on the user's roles'
   */
  private getPrimaryRole(roles: string[]): string {
    const priority = [
      RolesEnum.ROLE_SYSTEM_ADMINISTRATOR,
      RolesEnum.ROLE_MUNICIPAL_ADMINISTRATOR,
      RolesEnum.ROLE_DRIVER,
      RolesEnum.ROLE_CITIZEN
    ];

    for (const role of priority) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0] || RolesEnum.ROLE_MUNICIPAL_ADMINISTRATOR;
  }

  /**
   * Check if the role is a mobile role
   */
  private isMobileRole(role: string): boolean {
    return role === RolesEnum.ROLE_DRIVER || role === RolesEnum.ROLE_CITIZEN;
  }

  /**
   * Detect whether the user is on a mobile device
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Message to display when user is on mobile and trying to access web app
   */
  private getMobileDesktopMessage(role: string): string {
    const appName = role === RolesEnum.ROLE_DRIVER
      ? 'WasteTrack Conductor'
      : 'WasteTrack Ciudadano';

    return `Por favor, completa esta acción desde la aplicación móvil ${appName}`;
  }

  /**
   * Message to display on successful redirect
   */
  private getSuccessMessage(role: string): string {
    const messages: Record<string, string> = {
      [RolesEnum.ROLE_SYSTEM_ADMINISTRATOR]: 'Redirigiendo al panel de administración del sistema...',
      [RolesEnum.ROLE_MUNICIPAL_ADMINISTRATOR]: 'Redirigiendo al inicio de sesión...',
      [RolesEnum.ROLE_DRIVER]: 'Abriendo aplicación de conductores...',
      [RolesEnum.ROLE_CITIZEN]: 'Abriendo aplicación de ciudadanos...'
    };

    return messages[role] || 'Redirigiendo...';
  }

  /**
   * Get app download info for mobile roles
   */
  getAppDownloadInfo(role: string): { appName: string; iosUrl: string; androidUrl: string } | null {
    if (!this.isMobileRole(role)) {
      return null;
    }

    const appName = role === RolesEnum.ROLE_DRIVER
      ? 'WasteTrack Conductor'
      : 'WasteTrack Ciudadano';

    return {
      appName,
      iosUrl: `https://apps.apple.com/app/${role === RolesEnum.ROLE_DRIVER ? 'wastetrack-driver' : 'wastetrack-citizen'}`,
      androidUrl: `https://play.google.com/store/apps/details?id=com.wastetrack.${role === RolesEnum.ROLE_DRIVER ? 'driver' : 'citizen'}`
    };
  }
}
