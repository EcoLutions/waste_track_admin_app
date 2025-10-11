import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActiveRoutesStore } from '../../model/store/active-routes';
import { RouteEntity, RouteStatusEnum, RouteTypeEnum } from '../../../../../entities/route/model';
import { WaypointStatusEnum, PriorityEnum } from '../../../../../entities/waypoint/model';
import { DistrictContextStore } from '../../../../../shared/stores/district-context.store';

type ViewMode = 'map' | 'list' | 'split';

@Component({
  selector: 'app-active-routes',
  imports: [CommonModule, FormsModule],
  templateUrl: './active-routes.page.html',
  styleUrl: './active-routes.page.css'
})
export class ActiveRoutesPage implements OnInit, OnDestroy {
  readonly store = inject(ActiveRoutesStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // View mode
  viewMode = signal<ViewMode>('list');

  // Selected route for detail panel
  selectedRoute = signal<RouteEntity | null>(null);

  // Search and filter signals
  searchTerm = signal('');
  selectedStatus = signal<RouteStatusEnum | null>(null);
  selectedType = signal<RouteTypeEnum | null>(null);
  showInProgressOnly = signal(true);

  // Computed signals for template
  readonly routes = computed(() => this.store.filteredRoutes());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly totalRoutes = computed(() => this.store.totalRoutes());
  readonly inProgressRoutes = computed(() => this.store.inProgressRoutes());
  readonly routesByStatus = computed(() => this.store.routesByStatus());
  readonly routesByType = computed(() => this.store.routesByType());
  readonly totalDistance = computed(() => this.store.totalDistance());
  readonly totalEstimatedDuration = computed(() => this.store.totalEstimatedDuration());
  readonly routesWithWaypoints = computed(() => this.store.routesWithWaypoints());
  readonly averageWaypointsPerRoute = computed(() => this.store.averageWaypointsPerRoute());
  readonly districtName = computed(() => this.store.districtName());

  readonly routeStatuses = Object.values(RouteStatusEnum);
  readonly routeTypes = Object.values(RouteTypeEnum);

  readonly hasActiveFilters = computed(() => {
    return this.searchTerm() !== '' ||
      this.selectedStatus() !== null ||
      this.selectedType() !== null;
  });

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
  }

  private async initializePage(): Promise<void> {
    if (!this.districtContextStore.isDistrictLoaded()) {
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    if (this.districtContextStore.districtId()) {
      await this.store.loadActiveRoutes();
    }

    this.searchTerm.set(this.store.searchTerm());
    this.selectedStatus.set(this.store.selectedStatus());
    this.selectedType.set(this.store.selectedType());
    this.showInProgressOnly.set(this.store.showInProgressOnly());
  }

  // View mode methods
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  // Search and filter methods
  onSearchTermChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.store.setSearchTerm(searchTerm);
  }

  onStatusFilterChange(status: string): void {
    const statusEnum = status === 'all' ? null : status as RouteStatusEnum;
    this.selectedStatus.set(statusEnum);
    this.store.setStatusFilter(statusEnum);
  }

  onTypeFilterChange(type: string): void {
    const typeEnum = type === 'all' ? null : type as RouteTypeEnum;
    this.selectedType.set(typeEnum);
    this.store.setTypeFilter(typeEnum);
  }

  onInProgressFilterChange(showInProgressOnly: boolean): void {
    this.showInProgressOnly.set(showInProgressOnly);
    this.store.setShowInProgressOnly(showInProgressOnly);
  }

  toggleInProgressFilter(): void {
    const newValue = !this.showInProgressOnly();
    this.showInProgressOnly.set(newValue);
    this.store.setShowInProgressOnly(newValue);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.selectedType.set(null);
    this.showInProgressOnly.set(true);
    this.store.clearFilters();
  }

  async refreshRoutes(): Promise<void> {
    await this.store.refreshRoutes();
  }

  // Route selection
  selectRoute(route: RouteEntity): void {
    if (this.selectedRoute()?.id === route.id) {
      this.selectedRoute.set(null);
    } else {
      this.selectedRoute.set(route);
    }
  }

  closeRouteDetail(): void {
    this.selectedRoute.set(null);
  }

  // Route status helpers
  isInProgress(route: RouteEntity): boolean {
    return route.status === RouteStatusEnum.IN_PROGRESS;
  }

  isCompleted(route: RouteEntity): boolean {
    return route.status === RouteStatusEnum.COMPLETED;
  }

  getRouteProgress(route: RouteEntity): number {
    if (route.waypoints.length === 0) return 0;
    const completed = route.waypoints.filter(w => w.status === WaypointStatusEnum.VISITED).length;
    return Math.round((completed / route.waypoints.length) * 100);
  }

  getCompletedWaypoints(route: RouteEntity): number {
    return route.waypoints.filter(w => w.status === WaypointStatusEnum.VISITED).length;
  }

  // Status label and class methods
  getStatusLabel(status: RouteStatusEnum): string {
    const labels = {
      [RouteStatusEnum.DRAFT]: 'Borrador',
      [RouteStatusEnum.ASSIGNED]: 'Asignada',
      [RouteStatusEnum.IN_PROGRESS]: 'En Progreso',
      [RouteStatusEnum.COMPLETED]: 'Completada',
      [RouteStatusEnum.CANCELLED]: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: RouteStatusEnum): string {
    const classes = {
      [RouteStatusEnum.DRAFT]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700',
      [RouteStatusEnum.ASSIGNED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700',
      [RouteStatusEnum.IN_PROGRESS]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700',
      [RouteStatusEnum.COMPLETED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700',
      [RouteStatusEnum.CANCELLED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700'
    };
    return classes[status] || 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700';
  }

  getTypeLabel(type: RouteTypeEnum): string {
    const labels = {
      [RouteTypeEnum.REGULAR]: 'Regular',
      [RouteTypeEnum.EMERGENCY]: 'Emergencia',
      [RouteTypeEnum.OPTIMIZED]: 'Optimizada'
    };
    return labels[type] || type;
  }

  getTypeClass(type: RouteTypeEnum): string {
    const classes = {
      [RouteTypeEnum.REGULAR]: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700',
      [RouteTypeEnum.EMERGENCY]: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700',
      [RouteTypeEnum.OPTIMIZED]: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700'
    };
    return classes[type] || 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700';
  }

  getTypeIcon(type: RouteTypeEnum): string {
    const icons = {
      [RouteTypeEnum.REGULAR]: 'pi pi-calendar',
      [RouteTypeEnum.EMERGENCY]: 'pi pi-exclamation-triangle',
      [RouteTypeEnum.OPTIMIZED]: 'pi pi-bolt'
    };
    return icons[type] || 'pi pi-circle';
  }

  // Waypoint helpers
  getWaypointStatusLabel(status: WaypointStatusEnum): string {
    const labels = {
      [WaypointStatusEnum.PENDING]: 'Pendiente',
      [WaypointStatusEnum.VISITED]: 'Visitado',
      [WaypointStatusEnum.SKIPPED]: 'Omitido'
    };
    return labels[status] || status;
  }

  getWaypointStatusClass(status: WaypointStatusEnum): string {
    const classes = {
      [WaypointStatusEnum.PENDING]: 'px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded',
      [WaypointStatusEnum.VISITED]: 'px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded',
      [WaypointStatusEnum.SKIPPED]: 'px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded'
    };
    return classes[status] || 'px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded';
  }

  getPriorityLabel(priority: PriorityEnum): string {
    const labels = {
      [PriorityEnum.LOW]: 'Baja',
      [PriorityEnum.MEDIUM]: 'Media',
      [PriorityEnum.HIGH]: 'Alta',
      [PriorityEnum.CRITICAL]: 'Crítica'
    };
    return labels[priority] || priority;
  }

  getPriorityClass(priority: PriorityEnum): string {
    const classes = {
      [PriorityEnum.LOW]: 'text-gray-500',
      [PriorityEnum.MEDIUM]: 'text-blue-600',
      [PriorityEnum.HIGH]: 'text-orange-600',
      [PriorityEnum.CRITICAL]: 'text-red-600 font-semibold'
    };
    return classes[priority] || 'text-gray-500';
  }

  // Formatting methods
  formatDate(date: Date | null): string {
    if (!date) return 'No programado';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatTime(date: Date | null): string {
    if (!date) return '--:--';
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  formatDuration(minutes: number | null): string {
    if (!minutes) return 'No estimado';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}
