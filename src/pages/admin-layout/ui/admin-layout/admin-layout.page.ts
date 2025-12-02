import {Component, effect, HostListener, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {SidebarComponent} from '../../../../features/layout/ui/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../features/layout/ui/header/header.component';

interface NavItem {
  label: string;
  routerLink?: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
  ariaLabel?: string;
  items?: NavItem[];
  separator?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.page.html',
  styleUrl: './admin-layout.page.css'
})
export class AdminLayoutComponent {
  private router = inject(Router);

  // Signals
  sidebarOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isMobile = signal<boolean>(false);

  // Navigation items
  navItems: NavItem[] = [
    {
      label: 'Contenedores',
      icon: 'pi pi-box',
      ariaLabel: 'Gestión de contenedores',
      items: [
        {
          label: 'Monitoreo',
          routerLink: '/containers',
          icon: 'pi pi-map',
          ariaLabel: 'Monitorear contenedores en mapa'
        },
        {
          label: 'Alertas',
          routerLink: '/containers/alerts',
          icon: 'pi pi-bell',
          ariaLabel: 'Ver alertas de contenedores - 5 nuevas'
        },
        {
          label: 'Crear Contenedor',
          routerLink: '/containers/create',
          icon: 'pi pi-plus',
          ariaLabel: 'Registrar nuevo contenedor'
        }
      ]
    },
    {
      label: 'Rutas',
      icon: 'pi pi-map-marker',
      ariaLabel: 'Gestión de rutas',
      items: [
        {
          label: 'Rutas Activas',
          routerLink: '/routes/active',
          icon: 'pi pi-directions',
          ariaLabel: 'Ver rutas activas'
        },
        {
          label: 'Historial',
          routerLink: '/routes/history',
          icon: 'pi pi-history',
          ariaLabel: 'Historial de rutas'
        },
        {
          label: 'Crear Ruta',
          routerLink: '/routes/create',
          icon: 'pi pi-plus',
          ariaLabel: 'Crear nueva ruta'
        }
      ]
    },
    {
      label: 'Flota',
      icon: 'pi pi-truck',
      ariaLabel: 'Gestión de flota vehicular',
      items: [
        {
          label: 'Gestión',
          routerLink: '/fleet',
          icon: 'pi pi-car',
          ariaLabel: 'Administrar vehículos'
        },
        {
          label: 'Crear vehículo',
          routerLink: '/fleet/create',
          icon: 'pi pi-plus',
          ariaLabel: 'Crear nuevo vehículo'
        }
      ]
    },
    {
      label: 'Reportes Ciudadanos',
      icon: 'pi pi-megaphone',
      ariaLabel: 'Gestión de reportes ciudadanos',
      items: [
        {
          label: 'Ver Reportes',
          routerLink: '/citizen-reports',
          icon: 'pi pi-list',
          ariaLabel: 'Ver reportes ciudadanos - 8 nuevos'
        },
        {
          label: 'Crear Reporte',
          routerLink: '/citizen-reports/create',
          icon: 'pi pi-plus',
          ariaLabel: 'Crear nuevo reporte'
        }
      ]
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      ariaLabel: 'Gestión de usuarios',
      items: [
        {
          label: 'Conductores',
          routerLink: '/users/drivers',
          icon: 'pi pi-id-card',
          ariaLabel: 'Gestionar conductores'
        },
        {
          label: 'Ciudadanos',
          routerLink: '/users/citizens',
          icon: 'pi pi-user-plus',
          ariaLabel: 'Gestionar ciudadanos'
        },
      ]
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      ariaLabel: 'Configuración del sistema',
      items: [
        {
          label: 'Distrito',
          routerLink: '/district',
          icon: 'pi pi-sliders-h',
          ariaLabel: 'Configuración general'
        },
      ]
    }
  ];

  constructor() {
    this.checkScreenSize();
    this.setupRouterListener();
    this.setupSidebarAutoClose();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 1024);
    if (!this.isMobile() && this.sidebarOpen()) {
      this.sidebarOpen.set(false);
    }
  }

  private setupRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  private setupSidebarAutoClose(): void {
    effect(() => {
      if (this.sidebarOpen()) {
        document.addEventListener('keydown', this.handleEscape);
      } else {
        document.removeEventListener('keydown', this.handleEscape);
      }
    });
  }

  private handleEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.sidebarOpen()) {
      this.closeSidebar();
    }
  };

  toggleSidebar(): void {
    this.sidebarOpen.update(state => !state);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  handleNavigation(item: NavItem): void {
    if (item.disabled) return;
    this.isLoading.set(true);
    if (this.isMobile()) {
      this.closeSidebar();
    }
  }

  handleLogout(): void {
    console.log('Logging out...');
    // El header component ya maneja el logout con authStore.signOut()
    // Solo necesitamos navegar al login después del logout
    this.router.navigate(['/login']).then(() => {});
  }
}
