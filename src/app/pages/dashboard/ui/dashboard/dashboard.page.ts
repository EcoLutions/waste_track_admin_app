import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStore } from '../../model/store/dashboard';
import { DistrictContextStore } from '../../../../shared/stores/district-context.store';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage implements OnInit, OnDestroy {
  readonly store = inject(DashboardStore);
  readonly districtContextStore = inject(DistrictContextStore);

  // Computed signals for template
  readonly isLoading = computed(() => this.store.isLoading());
  readonly error = computed(() => this.store.error());
  readonly lastUpdated = computed(() => this.store.lastUpdated());

  // Container metrics
  readonly totalContainers = computed(() => this.store.totalContainers());
  readonly activeContainers = computed(() => this.store.activeContainers());
  readonly containersNeedingCollection = computed(() => this.store.containersNeedingCollection());
  readonly containersWithAlerts = computed(() => this.store.containersWithAlerts());

  // Vehicle metrics
  readonly totalVehicles = computed(() => this.store.totalVehicles());
  readonly activeVehicles = computed(() => this.store.activeVehicles());
  readonly vehiclesNeedingMaintenance = computed(() => this.store.vehiclesNeedingMaintenance());

  // Driver metrics
  readonly totalDrivers = computed(() => this.store.totalDrivers());
  readonly availableDrivers = computed(() => this.store.availableDrivers());
  readonly driversOnRoute = computed(() => this.store.driversOnRoute());

  // Route metrics
  readonly totalRoutes = computed(() => this.store.totalRoutes());
  readonly activeRoutes = computed(() => this.store.activeRoutes());
  readonly completedRoutesToday = computed(() => this.store.completedRoutesToday());

  // Citizen metrics
  readonly totalCitizens = computed(() => this.store.totalCitizens());
  readonly activeCitizens = computed(() => this.store.activeCitizens());

  // Overall metrics
  readonly systemHealthScore = computed(() => this.store.systemHealthScore());
  readonly districtName = computed(() => this.store.districtName());

  ngOnInit(): void {
    this.initializeDashboard();
  }

  ngOnDestroy(): void {
    // Reset store state when leaving the page
    this.store.resetState();
  }

  private async initializeDashboard(): Promise<void> {
    // Wait for district context to be available
    if (!this.districtContextStore.isDistrictLoaded()) {
      // If district is not loaded, try to initialize it
      try {
        await this.districtContextStore.initializeDistrictContext();
      } catch (error) {
        console.error('Error initializing district context:', error);
      }
    }

    // Load dashboard data once district context is available
    if (this.districtContextStore.districtId()) {
      await this.store.loadDashboardData();
    }
  }

  // Dashboard management methods
  async refreshDashboard(): Promise<void> {
    await this.store.refreshDashboard();
  }

  // Helper methods for template
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  formatDate(date: Date | null): string {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getHealthScoreClass(score: number): string {
    if (score >= 80) return 'health-excellent';
    if (score >= 60) return 'health-good';
    if (score >= 40) return 'health-fair';
    return 'health-poor';
  }

  getHealthScoreText(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  }

  getHealthScoreIcon(score: number): string {
    if (score >= 80) return 'pi pi-check-circle';
    if (score >= 60) return 'pi pi-info-circle';
    if (score >= 40) return 'pi pi-exclamation-triangle';
    return 'pi pi-times-circle';
  }

  getContainerFillLevelClass(fillLevel: number): string {
    if (fillLevel >= 90) return 'fill-critical';
    if (fillLevel >= 80) return 'fill-warning';
    if (fillLevel >= 60) return 'fill-normal';
    return 'fill-low';
  }

  getContainerFillLevelText(fillLevel: number): string {
    if (fillLevel >= 90) return 'Crítico';
    if (fillLevel >= 80) return 'Alto';
    if (fillLevel >= 60) return 'Normal';
    return 'Bajo';
  }
}
