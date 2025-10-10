# Route Planning Execution Frontend Types

Este directorio contiene todos los tipos TypeScript necesarios para integrar el módulo de planificación y ejecución de rutas en el frontend de Angular.

## 📁 Estructura de Archivos

### DTOs de Request (Peticiones al Backend)
- `create-route-request.type.ts` - Para crear nuevas rutas
- `create-waypoint-request.type.ts` - Para crear nuevos puntos de ruta
- `update-route-request.type.ts` - Para actualizar rutas existentes
- `update-waypoint-request.type.ts` - Para actualizar puntos de ruta

### DTOs de Response (Respuestas del Backend)
- `route-response.type.ts` - Información completa de rutas con métricas
- `waypoint-response.type.ts` - Información de puntos de ruta

### Entidades de Dominio
- `route.entity.ts` - Entidad Route para frontend (con waypoints)
- `waypoint.entity.ts` - Entidad WayPoint para frontend

### Enums
- `route-status.enum.ts` - Estados de ruta: DRAFT, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- `route-type.enum.ts` - Tipos de ruta: REGULAR, EMERGENCY, OPTIMIZED
- `waypoint-status.enum.ts` - Estados de waypoint: PENDING, VISITED, SKIPPED
- `priority.enum.ts` - Niveles de prioridad: LOW, MEDIUM, HIGH, CRITICAL

## 🚀 Uso Básico

### 1. Importar los tipos necesarios

```typescript
import { CreateRouteRequest } from './route-planning-execution-frontend-types/create-route-request.type';
import { RouteResponse } from './route-planning-execution-frontend-types/route-response.type';
import { RouteEntity } from './route-planning-execution-frontend-types/route.entity';
import { RouteStatusEnum, RouteTypeEnum } from './route-planning-execution-frontend-types/route-status.enum';
```

### 2. Ejemplo de uso en un servicio

```typescript
@Injectable({
  providedIn: 'root'
})
export class RouteService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'routes';
  }

  create(routeData: CreateRouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(
      this.resourcePath(),
      routeData,
      this.httpOptions
    );
  }

  getAll(): Observable<RouteResponse[]> {
    return this.http.get<RouteResponse[]>(
      this.resourcePath(),
      this.httpOptions
    );
  }

  startRoute(routeId: string): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(
      `${this.resourcePath()}/${routeId}/start`,
      {},
      this.httpOptions
    );
  }

  completeRoute(routeId: string): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(
      `${this.resourcePath()}/${routeId}/complete`,
      {},
      this.httpOptions
    );
  }
}
```

### 3. Ejemplo de gestión de waypoints

```typescript
@Injectable({
  providedIn: 'root'
})
export class WaypointService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'waypoints';
  }

  addWaypointToRoute(routeId: string, waypointData: CreateWaypointRequest): Observable<WaypointResponse> {
    return this.http.post<WaypointResponse>(
      `${this.resourcePath()}`,
      { ...waypointData, routeId },
      this.httpOptions
    );
  }

  markWaypointAsVisited(waypointId: string, arrivalTime: string): Observable<WaypointResponse> {
    return this.http.post<WaypointResponse>(
      `${this.resourcePath()}/${waypointId}/visit`,
      { arrivalTime },
      this.httpOptions
    );
  }
}
```

## 🔄 Conversión de Tipos

### Backend vs Frontend

| Java (Backend) | TypeScript (Frontend) | Notas |
|---------------|----------------------|-------|
| `String` | `string \| null` | Siempre nullable en DTOs |
| `Integer` | `number \| null` | Números |
| `LocalDate` | `string \| null` | ISO 8601 en DTOs |
| `LocalDateTime` | `string \| null` | ISO 8601 en DTOs |
| `Duration` | `number \| null` | Minutos en Entities |
| `UUID` | `string \| null` | IDs como strings |
| `Enum` | `string \| null` | String en DTOs |

### En Entities (Modelos de dominio)
| Java (Backend) | TypeScript (Entity) | Notas |
|---------------|---------------------|-------|
| `String` | `string` | NO nullable |
| `Integer` | `number` | NO nullable |
| `LocalDate` | `Date` | Convertir a Date object |
| `LocalDateTime` | `Date` | Convertir a Date object |
| `Duration` | `number` | Minutos totales |
| `UUID` | `string` | NO nullable |
| `Enum` | `Enum` (TS) | Enum TypeScript |

## 📋 Endpoints Disponibles

Basado en los DTOs extraídos, el backend expone los siguientes endpoints:

### Rutas
- `GET /api/v1/routes` - Listar rutas
- `GET /api/v1/routes/{id}` - Obtener ruta por ID
- `POST /api/v1/routes` - Crear ruta
- `PUT /api/v1/routes/{id}` - Actualizar ruta
- `DELETE /api/v1/routes/{id}` - Eliminar ruta
- `POST /api/v1/routes/{id}/start` - Iniciar ejecución de ruta
- `POST /api/v1/routes/{id}/complete` - Completar ruta

### Waypoints (Puntos de Ruta)
- `GET /api/v1/waypoints` - Listar waypoints
- `GET /api/v1/waypoints/{id}` - Obtener waypoint por ID
- `POST /api/v1/waypoints` - Crear waypoint
- `PUT /api/v1/waypoints/{id}` - Actualizar waypoint
- `DELETE /api/v1/waypoints/{id}` - Eliminar waypoint
- `POST /api/v1/waypoints/{id}/visit` - Marcar waypoint como visitado

## 🎯 Características de las Entidades

### Route (Ruta)
- **Estados de ejecución**: DRAFT → ASSIGNED → IN_PROGRESS → COMPLETED
- **Tipos de ruta**: REGULAR, EMERGENCY, OPTIMIZED
- **Métricas**: distancia total, duración estimada vs real
- **Waypoints**: colección ordenada de puntos de visita
- **Asignaciones**: vehículo y conductor asignados

### WayPoint (Punto de Ruta)
- **Prioridad**: LOW, MEDIUM, HIGH, CRITICAL
- **Estados**: PENDING → VISITED/SKIPPED
- **Tiempo estimado**: cuándo debería llegar el conductor
- **Tiempo real**: cuándo realmente llegó
- **Secuencia**: orden de visita en la ruta

## 🔒 Estados y Transiciones

### Estados de Ruta
```typescript
// Crear ruta (estado inicial)
const route = new RouteEntity();
// route.status = RouteStatusEnum.DRAFT

// Asignar vehículo y conductor
route.status = RouteStatusEnum.ASSIGNED;

// Iniciar ejecución
route.status = RouteStatusEnum.IN_PROGRESS;

// Completar ruta
route.status = RouteStatusEnum.COMPLETED;
```

### Estados de Waypoint
```typescript
// Crear waypoint (estado inicial)
waypoint.status = WaypointStatusEnum.PENDING;

// Marcar como visitado
waypoint.status = WaypointStatusEnum.VISITED;

// Saltar waypoint
waypoint.status = WaypointStatusEnum.SKIPPED;
```

## 🛠️ Instalación

1. Copia la carpeta `route-planning-execution-frontend-types` a tu proyecto Angular
2. Importa los tipos según necesites
3. Asegúrate de tener configurado HttpClient en tu app

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // otros providers...
  ]
};
```

## 📝 Notas Importantes

- **Estados estrictos** - Cada entidad tiene estados bien definidos con transiciones válidas
- **Fechas como Date objects** - En entities se convierten automáticamente de ISO strings
- **Duraciones en minutos** - Para facilitar cálculos y comparaciones
- **Prioridades por nivel** - LOW, MEDIUM, HIGH, CRITICAL para ordenamiento óptimo
- **Waypoints ordenados** - Siempre ordenados por sequenceOrder ascendente

## 🔧 Ejemplos de Mappers

### Route Response → Entity
```typescript
export class RouteEntityFromResponseMapper {
  static fromDtoToEntity(dto: RouteResponse): RouteEntity {
    return {
      id: dto.id ?? '',
      districtId: dto.districtId ?? '',
      vehicleId: dto.vehicleId,
      driverId: dto.driverId,
      routeType: RouteTypeMapper.fromStringToEnum(dto.routeType ?? ''),
      status: RouteStatusMapper.fromStringToEnum(dto.status ?? ''),
      scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : new Date(),
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      waypoints: [], // Se cargarían desde endpoint separado
      totalDistance: dto.totalDistance?.value ?? null,
      estimatedDuration: DurationMapper.fromResourceToMinutes(dto.estimatedDuration),
      actualDuration: DurationMapper.fromResourceToMinutes(dto.actualDuration)
    };
  }
}
```

### Waypoint Response → Entity
```typescript
export class WaypointEntityFromResponseMapper {
  static fromDtoToEntity(dto: WaypointResponse): WaypointEntity {
    return {
      id: dto.id ?? '',
      containerId: dto.containerId ?? '',
      sequenceOrder: dto.sequenceOrder ?? 0,
      priority: PriorityMapper.fromStringToEnum(dto.priority ?? ''),
      status: WaypointStatusMapper.fromStringToEnum(dto.status ?? ''),
      estimatedArrivalTime: dto.estimatedArrivalTime ? new Date(dto.estimatedArrivalTime) : null,
      actualArrivalTime: dto.actualArrivalTime ? new Date(dto.actualArrivalTime) : null,
      serviceTime: null, // Se calcula basado en tiempos reales
      driverNote: dto.driverNote
    };
  }
}
```

## 📚 Referencias

- [Documentación del Backend](https://github.com/tu-proyecto/waste-track-platform)
- [Guía de Angular HTTP Client](https://angular.dev/guide/http)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)