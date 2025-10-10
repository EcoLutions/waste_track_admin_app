import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet, Router, NavigationEnd, RouterModule} from '@angular/router';
import { filter } from 'rxjs';
import {HeaderComponent} from '../../../../../features/layout/ui/header/header.component';
import {SidebarComponent} from '../../../../../features/layout/ui/sidebar/sidebar.component';

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
      label: 'Dashboard',
      routerLink: '/dashboard',
      icon: 'pi pi-home',
      ariaLabel: 'Ir al panel principal'
    },
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
          badge: 5,
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
          label: 'Optimización',
          routerLink: '/routes',
          icon: 'pi pi-sparkles',
          ariaLabel: 'Optimizar rutas'
        },
        {
          label: 'Optimizador',
          routerLink: '/routes/optimize',
          icon: 'pi pi-compass',
          ariaLabel: 'Herramienta de optimización'
        },
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
          label: 'Reportes',
          routerLink: '/routes/reports',
          icon: 'pi pi-file-pdf',
          ariaLabel: 'Reportes de rutas'
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
          label: 'Monitoreo',
          routerLink: '/fleet/monitoring',
          icon: 'pi pi-eye',
          ariaLabel: 'Monitorear vehículos en tiempo real'
        },
        {
          label: 'Mantenimiento',
          routerLink: '/fleet/maintenance',
          icon: 'pi pi-wrench',
          badge: 2,
          ariaLabel: 'Programar mantenimiento - 2 pendientes'
        },
        {
          label: 'Costos Operacionales',
          routerLink: '/fleet/costs',
          icon: 'pi pi-dollar',
          ariaLabel: 'Ver costos operacionales'
        },
        {
          label: 'Asignación',
          routerLink: '/fleet/assignment',
          icon: 'pi pi-users',
          ariaLabel: 'Asignar vehículos'
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
          badge: 8,
          ariaLabel: 'Ver reportes ciudadanos - 8 nuevos'
        },
        {
          label: 'Gestionar',
          routerLink: '/citizen-reports/manage',
          icon: 'pi pi-check-square',
          ariaLabel: 'Gestionar reportes'
        },
        {
          label: 'Analíticas',
          routerLink: '/citizen-reports/analytics',
          icon: 'pi pi-chart-line',
          ariaLabel: 'Analíticas de reportes'
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
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      ariaLabel: 'Analytics y predicciones',
      items: [
        {
          label: 'Dashboard Analytics',
          routerLink: '/analytics',
          icon: 'pi pi-chart-pie',
          ariaLabel: 'Dashboard de analytics'
        },
        {
          label: 'Predicciones',
          routerLink: '/analytics/predictions',
          icon: 'pi pi-forward',
          ariaLabel: 'Predicciones de contenedores'
        },
        {
          label: 'Patrones de Generación',
          routerLink: '/analytics/patterns',
          icon: 'pi pi-sitemap',
          ariaLabel: 'Análisis de patrones'
        },
        {
          label: 'Dashboard Ejecutivo',
          routerLink: '/analytics/executive',
          icon: 'pi pi-briefcase',
          ariaLabel: 'Dashboard ejecutivo'
        }
      ]
    },
    {
      label: 'Cumplimiento',
      icon: 'pi pi-shield',
      ariaLabel: 'Cumplimiento regulatorio',
      items: [
        {
          label: 'Dashboard',
          routerLink: '/compliance',
          icon: 'pi pi-check-circle',
          ariaLabel: 'Dashboard de cumplimiento'
        },
        {
          label: 'Reportes MINAM',
          routerLink: '/compliance/minam-reports',
          icon: 'pi pi-file',
          ariaLabel: 'Reportes para MINAM'
        },
        {
          label: 'Residuos Peligrosos',
          routerLink: '/compliance/hazardous-waste',
          icon: 'pi pi-exclamation-triangle',
          ariaLabel: 'Gestión de residuos peligrosos'
        }
      ]
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      ariaLabel: 'Gestión de usuarios',
      items: [
        {
          label: 'Todos los Usuarios',
          routerLink: '/users',
          icon: 'pi pi-user',
          ariaLabel: 'Ver todos los usuarios'
        },
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
        {
          label: 'Roles y Permisos',
          routerLink: '/users/roles',
          icon: 'pi pi-key',
          ariaLabel: 'Administrar roles y permisos'
        }
      ]
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      ariaLabel: 'Configuración del sistema',
      items: [
        {
          label: 'General',
          routerLink: '/settings',
          icon: 'pi pi-sliders-h',
          ariaLabel: 'Configuración general'
        },
        {
          label: 'Mi Perfil',
          routerLink: '/settings/profile',
          icon: 'pi pi-user-edit',
          ariaLabel: 'Editar mi perfil'
        },
        {
          label: 'Notificaciones',
          routerLink: '/settings/notifications',
          icon: 'pi pi-bell',
          ariaLabel: 'Configurar notificaciones'
        },
        {
          label: 'Integraciones',
          routerLink: '/settings/integrations',
          icon: 'pi pi-link',
          ariaLabel: 'Gestionar integraciones'
        }
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
