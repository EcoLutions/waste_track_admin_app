import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '../shared';

import { AdminLayoutComponent } from './pages/admin-layout/ui/admin-layout/admin-layout.page';
import { DashboardPage } from './pages/dashboard/ui/dashboard/dashboard.page';
import { ContainerMonitoringPage } from './pages/container-monitoring/ui/container-monitoring/container-monitoring.page';
import { ContainerAlertsPage } from './pages/container-alerts/ui/container-alerts/container-alerts.page';
import { ContainerHistoryPage } from './pages/container-history/ui/container-history/container-history.page';
import { ContainerSettingsPage } from './pages/container-settings/ui/container-settings/container-settings.page';
import { CreateContainerPage } from './pages/create-container/ui/create-container/create-container.page';
import { CreateVehiclePage } from './pages/create-vehicle/ui/create-vehicle/create-vehicle.page';
import { RouteOptimizationPage } from './pages/route-optimization/ui/route-optimization/route-optimization.page';
import { RouteOptimizerPage } from './pages/route-optimizer/ui/route-optimizer/route-optimizer.page';
import { ActiveRoutesPage } from './pages/active-routes/ui/active-routes/active-routes.page';
import { RoutesHistoryPage } from './pages/routes-history/ui/routes-history/routes-history.page';
import { RouteReportsPage } from './pages/route-reports/ui/route-reports/route-reports.page';
import { CreateRoutePage } from './pages/create-route/ui/create-route/create-route.page';
import { FleetManagementPage } from './pages/fleet-management/ui/fleet-management/fleet-management.page';
import { FleetMonitoringPage } from './pages/fleet-monitoring/ui/fleet-monitoring/fleet-monitoring.page';
import { MaintenanceSchedulePage } from './pages/maintenance-schedule/ui/maintenance-schedule/maintenance-schedule.page';
import { OperationalCostsPage } from './pages/operational-costs/ui/operational-costs/operational-costs.page';
import { VehicleAssignmentPage } from './pages/vehicle-assignment/ui/vehicle-assignment/vehicle-assignment.page';
import { CitizenReportsPage } from './pages/citizen-reports/ui/citizen-reports/citizen-reports.page';
import { CreateReportPage } from './pages/create-report/ui/create-report/create-report.page';
import { ManageReportsPage } from './pages/manage-reports/ui/manage-reports/manage-reports.page';
import { ReportsAnalyticsPage } from './pages/reports-analytics/ui/reports-analytics/reports-analytics.page';
import { AnalyticsPage } from './pages/analytics/ui/analytics/analytics.page';
import { ContainerPredictionPage } from './pages/container-prediction/ui/container-prediction/container-prediction.page';
import { GenerationPatternsPage } from './pages/generation-patterns/ui/generation-patterns/generation-patterns.page';
import { ExecutiveDashboardPage } from './pages/executive-dashboard/ui/executive-dashboard/executive-dashboard.page';
import { CompliancePage } from './pages/compliance/ui/compliance/compliance.page';
import { MinamReportsPage } from './pages/minam-reports/ui/minam-reports/minam-reports.page';
import { ComplianceDashboardPage } from './pages/compliance-dashboard/ui/compliance-dashboard/compliance-dashboard.page';
import { HazardousWastePage } from './pages/hazardous-waste/ui/hazardous-waste/hazardous-waste.page';
import { UserManagementPage } from './pages/user-management/ui/user-management/user-management.page';
import { DriversPage } from './pages/drivers/ui/drivers/drivers.page';
import { CitizensPage } from './pages/citizens/ui/citizens/citizens.page';
import { RolesPage } from './pages/roles/ui/roles/roles.page';
import { SettingsPage } from './pages/settings/ui/settings/settings.page';
import { ProfileSettingsPage } from './pages/profile-settings/ui/profile-settings/profile-settings.page';
import { NotificationSettingsPage } from './pages/notification-settings/ui/notification-settings/notification-settings.page';
import { IntegrationsPage } from './pages/integrations/ui/integrations/integrations.page';
import {LoginPage} from './pages/authentication/ui/login/login.page';
import {UnauthorizedPage} from './pages/authentication/ui/unauthorized/unauthorized.page';
import {CreateDriverPage} from './pages/create-driver/ui/create-driver/create-driver.page';

export const routes: Routes = [
  // ==================== PÁGINAS PÚBLICAS ====================
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'unauthorized',
    component: UnauthorizedPage
  },

  // ==================== PÁGINAS PRINCIPALES ====================
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // 🔒 Requiere autenticación
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ==================== DASHBOARD PRINCIPAL ====================
      {
        path: 'dashboard',
        component: DashboardPage
      },

      // ==================== MONITOREO DE CONTENEDORES ====================
      {
        path: 'containers',
        children: [
          { path: '', component: ContainerMonitoringPage },
          { path: 'map', component: ContainerMonitoringPage },
          { path: 'alerts', component: ContainerAlertsPage },
          { path: 'history/:id', component: ContainerHistoryPage },
          { path: 'settings/:id', component: ContainerSettingsPage },
          {
            path: 'create',
            component: CreateContainerPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          }
        ]
      },

      // ==================== OPTIMIZACIÓN DE RUTAS ====================
      {
        path: 'routes',
        children: [
          { path: '', component: RouteOptimizationPage },
          { path: 'optimize', component: RouteOptimizerPage },
          { path: 'active', component: ActiveRoutesPage },
          { path: 'history', component: RoutesHistoryPage },
          { path: 'reports', component: RouteReportsPage },
          {
            path: 'create',
            component: CreateRoutePage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          }
        ]
      },

      // ==================== GESTIÓN DE FLOTA ====================
      {
        path: 'fleet',
        children: [
          { path: '', component: FleetManagementPage },
          {
            path: 'create',
            component: CreateVehiclePage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          { path: 'monitoring', component: FleetMonitoringPage },
          { path: 'maintenance', component: MaintenanceSchedulePage },
          { path: 'costs', component: OperationalCostsPage },
          { path: 'assignment', component: VehicleAssignmentPage }
        ]
      },

      // ==================== REPORTES CIUDADANOS ====================
      {
        path: 'citizen-reports',
        children: [
          { path: '', component: CitizenReportsPage },
          {
            path: 'create',
            component: CreateReportPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          {
            path: 'manage',
            component: ManageReportsPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          { path: 'analytics', component: ReportsAnalyticsPage }
        ]
      },

      // ==================== ANALYTICS AVANZADO ====================
      {
        path: 'analytics',
        children: [
          { path: '', component: AnalyticsPage },
          {
            path: 'predictions',
            component: ContainerPredictionPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          {
            path: 'patterns',
            component: GenerationPatternsPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          {
            path: 'executive',
            component: ExecutiveDashboardPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          }
        ]
      },

      // ==================== CUMPLIMIENTO REGULATORIO ====================
      {
        path: 'compliance',
        canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])],
        children: [
          { path: '', component: CompliancePage },
          { path: 'minam-reports', component: MinamReportsPage },
          { path: 'dashboard', component: ComplianceDashboardPage },
          { path: 'hazardous-waste', component: HazardousWastePage }
        ]
      },

      // ==================== GESTIÓN DE USUARIOS ====================
      {
        path: 'users',
        canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])],
        children: [
          { path: '', component: UserManagementPage },
          { path: 'drivers', component: DriversPage },
          {
            path: 'drivers/create',
            component: CreateDriverPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          { path: 'citizens', component: CitizensPage },
          { path: 'roles', component: RolesPage }
        ]
      },

      // ==================== CONFIGURACIÓN ====================
      {
        path: 'settings',
        children: [
          {
            path: '',
            component: SettingsPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          },
          { path: 'profile', component: ProfileSettingsPage },
          { path: 'notifications', component: NotificationSettingsPage },
          {
            path: 'integrations',
            component: IntegrationsPage,
            canActivate: [roleGuard(['ROLE_MUNICIPAL_ADMINISTRATOR'])]
          }
        ]
      }
    ]
  }
];
