import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  routerLink?: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
  ariaLabel?: string;
  items?: NavItem[];
  expanded?: boolean;
  separator?: boolean;
  command?: () => void;
  visible?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private router = inject(Router);

  // Inputs
  isOpen = input.required<boolean>();
  navItems = input.required<NavItem[]>();

  // Outputs
  closeSidebar = output<void>();
  itemClick = output<NavItem>();

  // State para items expandidos
  expandedItems = signal<Set<string>>(new Set());

  constructor() {
    // Cerrar sidebar al navegar (mobile)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile()) {
          this.closeSidebar.emit();
        }
      });
  }

  // Helper para detectar mobile
  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }

  // Toggle submenu
  toggleSubmenu(item: NavItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const itemLabel = item.label;
    const expanded = this.expandedItems();

    if (expanded.has(itemLabel)) {
      expanded.delete(itemLabel);
    } else {
      expanded.add(itemLabel);
    }

    this.expandedItems.set(new Set(expanded));
  }

  // Verificar si un item está expandido
  isExpanded(item: NavItem): boolean {
    return this.expandedItems().has(item.label);
  }

  // Verificar si una ruta está activa
  isRouteActive(routerLink: string | undefined): boolean {
    if (!routerLink) return false;
    return this.router.url === routerLink || this.router.url.startsWith(routerLink + '/');
  }

  // Verificar si un item padre tiene una ruta activa
  hasActiveChild(item: NavItem): boolean {
    if (!item.items) return false;
    return item.items.some(child => this.isRouteActive(child.routerLink));
  }

  // Handle navigation
  handleNavigation(item: NavItem, event?: Event): void {
    if (item.disabled) {
      event?.preventDefault();
      return;
    }

    if (item.command) {
      event?.preventDefault();
      item.command();
    }

    if (item.items && item.items.length > 0) {
      this.toggleSubmenu(item, event!);
    } else {
      this.itemClick.emit(item);
    }
  }

  // Cerrar sidebar
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}
