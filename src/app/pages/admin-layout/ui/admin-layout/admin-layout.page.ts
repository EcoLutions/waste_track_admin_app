import {Component, computed, effect, HostListener, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet, RouterModule, Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs';

interface NavItem {
  label: string;
  routerLink: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './admin-layout.page.html',
  styleUrl: './admin-layout.page.css'
})
export class AdminLayoutComponent {
  private router = inject(Router);

  sidebarOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isMobile = signal<boolean>(false);

  userInfo = signal({
    name: 'Admin User',
    initials: 'AU',
    role: 'Administrador'
  });

  // Navigation items
/*  navItems = [
    { label: 'Dashboard', icon: 'pi-chart-line', routerLink: '/dashboard' },
    { label: 'Contenedores', icon: 'pi-box', routerLink: '/containers' },
    { label: 'Rutas', icon: 'pi-map', routerLink: '/routes' },
    { label: 'Flota', icon: 'pi-truck', routerLink: '/fleet' },
    { label: 'Reportes Ciudadanos', icon: 'pi-file-text', routerLink: '/citizen-reports' },
    { label: 'Analytics', icon: 'pi-chart-bar', routerLink: '/analytics' },
    { label: 'Cumplimiento', icon: 'pi-shield', routerLink: '/compliance' },
    { label: 'Usuarios', icon: 'pi-users', routerLink: '/users' },
    { label: 'Configuración', icon: 'pi-cog', routerLink: '/settings' }
  ];*/

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      routerLink: '/admin/dashboard',
      icon: 'pi pi-home',
      ariaLabel: 'Ir al panel principal'
    },
    {
      label: 'Usuarios',
      routerLink: '/admin/users',
      icon: 'pi pi-users',
      badge: 3,
      ariaLabel: 'Gestionar usuarios - 3 nuevos'
    },
    {
      label: 'Reportes',
      routerLink: '/admin/reports',
      icon: 'pi pi-chart-bar',
      ariaLabel: 'Ver reportes y estadísticas'
    },
    {
      label: 'Recolecciones',
      routerLink: '/admin/collections',
      icon: 'pi pi-calendar',
      ariaLabel: 'Programar recolecciones'
    },
    {
      label: 'Vehículos',
      routerLink: '/admin/vehicles',
      icon: 'pi pi-car',
      ariaLabel: 'Gestionar flota de vehículos'
    },
    {
      label: 'Zonas',
      routerLink: '/admin/zones',
      icon: 'pi pi-map-marker',
      ariaLabel: 'Administrar zonas de cobertura'
    },
    {
      label: 'Configuración',
      routerLink: '/admin/settings',
      icon: 'pi pi-cog',
      ariaLabel: 'Configuración del sistema'
    }
  ];

  // Computed property para determinar si estamos en mobile
  showOverlay = computed(() => this.sidebarOpen() && this.isMobile());

  constructor() {
    this.checkScreenSize();
    this.setupRouterListener();
    this.setupSidebarAutoClose();
  }

  // Detectar tamaño de pantalla
  @HostListener('window:resize')
  public checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 1024);
  }

  // Auto-cerrar sidebar en mobile al cambiar de ruta
  private setupRouterListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoading.set(false);
        if (this.isMobile()) {
          this.closeSidebar();
        }
      });
  }

  // Cerrar sidebar al presionar Escape
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

  // Toggle sidebar con feedback
  toggleSidebar(): void {
    this.sidebarOpen.update(state => !state);

    // Trap focus dentro del sidebar cuando está abierto en mobile
    if (this.sidebarOpen() && this.isMobile()) {
      setTimeout(() => this.trapFocus(), 100);
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  // Trap focus para accesibilidad
  private trapFocus(): void {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    const focusableElements = sidebar.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    sidebar.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }

  // Navigation handler con loading state
  handleNavigation(item: NavItem): void {
    if (item.disabled) return;

    this.isLoading.set(true);
    this.closeSidebar();
  }

  // Logout handler
  handleLogout(): void {
    // Aquí iría la lógica de logout real
    console.log('Logging out...');
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }

  // Determinar si un item está activo
  isItemActive(routerLink: string): boolean {
    return this.router.url === routerLink;
  }
}
