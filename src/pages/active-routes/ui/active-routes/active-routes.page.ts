import {Component, computed, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GoogleMap, MapAdvancedMarker, MapPolyline} from '@angular/google-maps';
import {ActiveRoutesStore} from '../../model/store/active-routes';
import {DistrictContextStore} from '../../../../shared/stores/district-context.store';
import {ContainerEntity, RouteEntity, RouteStatusEnum, WaypointStatusEnum} from '../../../../entities';
import {environment} from '../../../../environments/environment.development';

@Component({
  selector: 'app-active-routes',
  imports: [CommonModule, FormsModule, GoogleMap, MapAdvancedMarker, MapPolyline],
  providers: [ActiveRoutesStore],
  templateUrl: './active-routes.page.html',
  styleUrl: './active-routes.page.css'
})
export class ActiveRoutesPage implements OnInit, OnDestroy {
  readonly store = inject(ActiveRoutesStore);
  readonly districtContextStore = inject(DistrictContextStore);

  @ViewChild(GoogleMap) map!: GoogleMap;

  selectedRoute = signal<RouteEntity | null>(null);

  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMaps.mapIds.depot,
    disableDefaultUI: false,
    clickableIcons: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    zoom: 13
  };

  mapCenter = signal<google.maps.LatLngLiteral>({
    lat: -12.0464,
    lng: -77.0428
  });

  private markerContentCache = new Map<string, HTMLElement>();

  readonly routes = computed(() => this.store.filteredRoutes());
  readonly containers = computed(() => this.store.containers());
  readonly isLoading = computed(() => this.store.isLoading());
  readonly isLoadingDirections = computed(() => this.store.isLoadingDirections());
  readonly error = computed(() => this.store.error());
  readonly totalRoutes = computed(() => this.store.totalRoutes());
  readonly inProgressRoutes = computed(() => this.store.inProgressRoutes());
  readonly totalDistance = computed(() => this.store.totalDistance());
  readonly totalEstimatedDuration = computed(() => this.store.totalEstimatedDuration());
  readonly averageWaypointsPerRoute = computed(() => this.store.averageWaypointsPerRoute());
  readonly districtName = computed(() => this.store.districtName());

  readonly routeStatuses = Object.values(RouteStatusEnum);

  private readonly ROUTE_COLORS: Record<RouteStatusEnum, string> = {
    [RouteStatusEnum.PLANNED]: '#9CA3AF',
    [RouteStatusEnum.ACTIVE]: '#3B82F6',
    [RouteStatusEnum.IN_PROGRESS]: '#10B981',
    [RouteStatusEnum.COMPLETED]: '#8B5CF6',
    [RouteStatusEnum.CANCELLED]: '#EF4444'
  };

  ngOnInit(): void {
    this.initializePage().then(() => {});
  }

  ngOnDestroy(): void {
    this.store.resetState();
    this.markerContentCache.clear();
  }

  private async initializePage(): Promise<void> {
    if (this.districtContextStore.districtId()) {
      await this.store.loadActiveRoutes();
    }

    this.autoCenterMap();
  }

  private autoCenterMap(): void {
    const containers = this.containers();
    if (containers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    containers.forEach(container => {
      const lat = parseFloat(container.latitude);
      const lng = parseFloat(container.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend({ lat, lng });
      }
    });

    // Esperar a que el mapa esté listo
    setTimeout(() => {
      if (this.map && this.map.googleMap) {
        this.map.googleMap.fitBounds(bounds, 50);
      }
    }, 500);
  }

  getContainerMarkerContent(container: ContainerEntity): HTMLElement {
    const cacheKey = `container-${container.id}`;
    const existing = this.markerContentCache.get(cacheKey);
    if (existing) return existing;

    const div = document.createElement('div');
    div.innerHTML = this.generateContainerMarkerHtml(container);
    this.markerContentCache.set(cacheKey, div);
    return div;
  }

  private generateContainerMarkerHtml(container: ContainerEntity): string {
    const fillLevel = container.currentFillLevel;
    const isHigh = fillLevel > 80;

    const statusColor = container.status === 'active' ? '#16a34a' : '#ea580c';
    const bgColor = container.status === 'active' ? '#f0fdf4' : '#fff7ed';

    return `
      <div style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="background-color: ${bgColor}; border: 2px solid ${statusColor}; border-radius: 8px; padding: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <div style="width: 32px; height: 32px; position: relative;">
            <img src="assets/images/smart-trash.png" style="width: 100%; height: 100%; object-fit: contain;" alt="container">
          </div>
          <div style="text-align: center; margin-top: 2px;">
            <div style="font-size: 9px; font-weight: bold; color: ${isHigh ? '#dc2626' : '#666'}">${fillLevel}%</div>
          </div>
        </div>
      </div>
    `;
  }

  getRoutePolylines(): google.maps.PolylineOptions[] {
    const routes = this.routes();
    const polylines: google.maps.PolylineOptions[] = [];

    routes.forEach(route => {
      const directions = this.store.getDirections()(route.id);

      if (directions && directions.polylinePoints.length > 0) {
        polylines.push({
          path: directions.polylinePoints,
          strokeColor: this.ROUTE_COLORS[route.status],
          strokeOpacity: 0.8,
          strokeWeight: 4,
          geodesic: true,
          clickable: true,
          zIndex: route.id === this.selectedRoute()?.id ? 10 : 1
        });
      } else {
        const path = this.getRouteWaypointsPath(route);
        if (path.length > 0) {
          polylines.push({
            path,
            strokeColor: this.ROUTE_COLORS[route.status],
            strokeOpacity: 0.5,
            strokeWeight: 3,
            geodesic: true,
            clickable: true,
            zIndex: 0,
            icons: [{
              icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                scale: 2,
                strokeColor: this.ROUTE_COLORS[route.status]
              },
              offset: '100%',
              repeat: '100px'
            }]
          });
        }
      }
    });

    return polylines;
  }

  private getRouteWaypointsPath(route: RouteEntity): google.maps.LatLngLiteral[] {
    const containersMap = this.store.containersMap();

    return route.waypoints
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
      .map(wp => {
        const container = containersMap.get(wp.containerId);
        if (!container) return null;

        const lat = parseFloat(container.latitude);
        const lng = parseFloat(container.longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        return { lat, lng };
      })
      .filter(point => point !== null) as google.maps.LatLngLiteral[];
  }

  onPolylineClick(route: RouteEntity): void {
    this.selectRoute(route);
  }

  getRouteContainers(): ContainerEntity[] {
    const routes = this.routes();
    const containerIds = new Set<string>();

    routes.forEach(route => {
      route.waypoints.forEach(wp => containerIds.add(wp.containerId));
    });

    return this.containers().filter(c => containerIds.has(c.id));
  }

  focusOnRoute(route: RouteEntity): void {
    const directions = this.store.getDirections()(route.id);

    if (directions && this.map && this.map.googleMap) {
      this.map.googleMap.fitBounds(directions.bounds, 50);
    } else {
      // Fallback: centrar en waypoints
      const path = this.getRouteWaypointsPath(route);
      if (path.length > 0 && this.map && this.map.googleMap) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        this.map.googleMap.fitBounds(bounds, 50);
      }
    }
  }

  async refreshRoutes(): Promise<void> {
    await this.store.refreshRoutes();
    this.autoCenterMap();
  }

  selectRoute(route: RouteEntity): void {
    if (this.selectedRoute()?.id === route.id) {
      this.selectedRoute.set(null);
      this.store.selectRoute(null);
    } else {
      this.selectedRoute.set(route);
      this.store.selectRoute(route.id);
      this.focusOnRoute(route);
    }
  }

  closeRouteDetail(): void {
    this.selectedRoute.set(null);
    this.store.selectRoute(null);
  }

  isInProgress(route: RouteEntity): boolean {
    return route.status === RouteStatusEnum.IN_PROGRESS;
  }

  getRouteProgress(route: RouteEntity): number {
    if (route.waypoints.length === 0) return 0;
    const completed = route.waypoints.filter(w => w.status === WaypointStatusEnum.VISITED).length;
    return Math.round((completed / route.waypoints.length) * 100);
  }

  getCompletedWaypoints(route: RouteEntity): number {
    return route.waypoints.filter(w => w.status === WaypointStatusEnum.VISITED).length;
  }

  getStatusColor(status: RouteStatusEnum): string {
    return this.ROUTE_COLORS[status];
  }

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
